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
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '@environments/environment';

/**
 * Error message mappings by status code
 */
const ERROR_MESSAGES: Record<number, string> = {
  [HttpStatusCode.BadRequest]: 'Invalid request. Please check your input.',
  [HttpStatusCode.Unauthorized]: 'You are not authorized to perform this action.',
  [HttpStatusCode.Forbidden]: 'You do not have permission to access this resource.',
  [HttpStatusCode.NotFound]: 'The requested resource was not found.',
  [HttpStatusCode.MethodNotAllowed]: 'The request method is not allowed.',
  [HttpStatusCode.Conflict]: 'This resource already exists or conflicts with existing data.',
  [HttpStatusCode.UnprocessableEntity]: 'The request could not be processed. Please check your input.',
  [HttpStatusCode.TooManyRequests]: 'Too many requests. Please try again later.',
  [HttpStatusCode.InternalServerError]: 'An internal server error occurred. Please try again later.',
  [HttpStatusCode.BadGateway]: 'The server is temporarily unavailable. Please try again later.',
  [HttpStatusCode.ServiceUnavailable]: 'The service is temporarily unavailable. Please try again later.',
  [HttpStatusCode.GatewayTimeout]: 'The server timed out. Please try again later.',
};

/**
 * Status codes that should trigger a retry
 */
const RETRYABLE_STATUS_CODES = [
  HttpStatusCode.InternalServerError,
  HttpStatusCode.BadGateway,
  HttpStatusCode.ServiceUnavailable,
  HttpStatusCode.GatewayTimeout,
];

/**
 * Error HTTP interceptor
 * Centralized error handling for HTTP requests
 * Shows toast notifications for user-facing errors
 * Logs errors in development mode
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error, req);
      })
    );
  }

  /**
   * Handle HTTP error
   * @param error HTTP error response
   * @param request Original request
   * @returns Observable throwing error
   */
  private handleError(
    error: HttpErrorResponse,
    request: HttpRequest<unknown>
  ): Observable<never> {
    // Log error in development
    if (!environment.production) {
      console.error('[ErrorInterceptor] HTTP Error:', {
        url: request.url,
        status: error.status,
        message: error.message,
        error: error.error,
      });
    }

    // Check if error should be retried
    if (error.status && RETRYABLE_STATUS_CODES.includes(error.status)) {
      console.warn(`[ErrorInterceptor] Retriable error (${error.status}):`, request.url);
      // Note: Actual retry logic is handled by RetryInterceptor
    }

    // Extract error message from response
    const errorMessage = this.extractErrorMessage(error);

    // Show toast notification for user-facing errors
    if (this.shouldShowNotification(error)) {
      this.showErrorNotification(errorMessage);
    }

    // Throw error for component-level handling
    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      error: error.error,
      originalError: error,
    }));
  }

  /**
   * Extract error message from HTTP error response
   * @param error HTTP error response
   * @returns User-friendly error message
   */
  private extractErrorMessage(error: HttpErrorResponse): string {
    // Try to get message from error response body
    if (error.error) {
      // Check for nested message property
      if (typeof error.error === 'string') {
        try {
          const parsedError = JSON.parse(error.error);
          if (parsedError.message) return parsedError.message;
        } catch {
          return error.error;
        }
      }

      if (error.error.message) {
        return error.error.message;
      }

      if (error.error.error) {
        return error.error.error;
      }

      if (error.error.errors && Array.isArray(error.error.errors)) {
        // Return first validation error
        return error.error.errors[0]?.message || 'Validation error';
      }
    }

    // Use default message for known status codes
    if (error.status && ERROR_MESSAGES[error.status]) {
      return ERROR_MESSAGES[error.status];
    }

    // Fallback to error message or generic message
    return error.message || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Determine if error should show notification to user
   * @param error HTTP error response
   * @returns true if notification should be shown
   */
  private shouldShowNotification(error: HttpErrorResponse): boolean {
    // Don't show notifications for:
    // - 401 errors (handled by AuthInterceptor)
    // - Errors in background requests (polling, etc.)
    // - Errors in production mode that are already handled

    if (error.status === HttpStatusCode.Unauthorized) {
      return false;
    }

    // Check if request should be silent
    const url = error.url || '';
    const isBackgroundRequest = url.includes('/poll') || url.includes('/stream');

    return !isBackgroundRequest;
  }

  /**
   * Show error notification to user
   * @param message Error message
   */
  private showErrorNotification(message: string): void {
    // TODO: Implement toast notification service
    // For now, just log to console
    console.error('[ErrorInterceptor] User-facing error:', message);

    // Future implementation:
    // this.toastService.showError(message);
  }
}

/**
 * Factory function for ErrorInterceptor
 * Required for Angular's inject()-based DI
 */
export const errorInterceptorFactory = () => new ErrorInterceptor();
