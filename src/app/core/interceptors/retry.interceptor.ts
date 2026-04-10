import {
  Injectable,
  inject,
} from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retryWhen, tap, delayWhen, scan } from 'rxjs/operators';

import { environment } from '@environments/environment';

/**
 * Retry configuration
 */
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000; // 1 second
const BACKOFF_MULTIPLIER = 2; // Double the delay each retry

/**
 * Status codes that should trigger a retry
 */
const RETRYABLE_STATUS_CODES = [
  HttpStatusCode.InternalServerError,
  HttpStatusCode.BadGateway,
  HttpStatusCode.ServiceUnavailable,
  HttpStatusCode.GatewayTimeout,
  HttpStatusCode.RequestTimeout,
  429, // Too Many Requests
];

/**
 * URLs that should NOT be retried
 */
const EXCLUDED_URLS = [
  '/auth/login', // Don't retry login requests
  '/auth/register', // Don't retry registration
  '/auth/logout', // Don't retry logout
  '/upload', // Don't retry file uploads
];

/**
 * Check if URL should be excluded from retry logic
 * @param url Request URL
 * @returns true if URL should be excluded
 */
function shouldExcludeFromRetry(url: string): boolean {
  return EXCLUDED_URLS.some((excludedUrl) => url.includes(excludedUrl));
}

/**
 * Retry HTTP interceptor
 * Automatically retries failed requests with exponential backoff
 * Retries 5xx errors and 429 (Too Many Requests)
 */
@Injectable()
export class RetryInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      retryWhen((errors$) =>
        errors$.pipe(
          scan((errorCount, error: HttpErrorResponse) => {
            // Check if error is retryable
            if (!this.isRetryable(error, req, errorCount)) {
              throw error;
            }

            // Calculate retry count
            const newErrorCount = errorCount + 1;

            // Log retry attempt in development
            if (!environment.production) {
              console.warn(
                `[RetryInterceptor] Retry attempt ${newErrorCount}/${MAX_RETRIES} for ${req.url}`
              );
            }

            return newErrorCount;
          }, 0),
          delayWhen((errorCount) => {
            // Calculate delay with exponential backoff
            const delay = this.calculateRetryDelay(errorCount);

            // Log delay in development
            if (!environment.production) {
              console.log(`[RetryInterceptor] Delaying ${delay}ms before retry`);
            }

            return timer(delay);
          })
        )
      )
    );
  }

  /**
   * Check if error should be retried
   * @param error HTTP error response
   * @param request Original request
   * @param errorCount Current retry attempt count
   * @returns true if request should be retried
   */
  private isRetryable(
    error: HttpErrorResponse,
    request: HttpRequest<unknown>,
    errorCount: number
  ): boolean {
    // Check if max retries exceeded
    if (errorCount >= MAX_RETRIES) {
      return false;
    }

    // Check if URL is excluded from retry
    if (shouldExcludeFromRetry(request.url)) {
      return false;
    }

    // Check if error status is retryable
    if (error.status && RETRYABLE_STATUS_CODES.includes(error.status)) {
      return true;
    }

    // Check if it's a network error (no status)
    if (!error.status) {
      return true;
    }

    return false;
  }

  /**
   * Calculate retry delay with exponential backoff
   * @param retryCount Current retry attempt (1-based)
   * @returns Delay in milliseconds
   */
  private calculateRetryDelay(retryCount: number): number {
    // Exponential backoff: delay * (2 ^ (retryCount - 1))
    return INITIAL_DELAY_MS * Math.pow(BACKOFF_MULTIPLIER, retryCount - 1);
  }
}

/**
 * Factory function for RetryInterceptor
 * Required for Angular's inject()-based DI
 */
export const retryInterceptorFactory = () => new RetryInterceptor();
