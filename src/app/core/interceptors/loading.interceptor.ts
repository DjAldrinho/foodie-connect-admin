import {
  Injectable,
  inject,
  OnDestroy,
} from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, timer, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LoadingStateService } from '../services/loading-state.service';

/**
 * URLs that should NOT trigger loading indicator
 */
const EXCLUDED_URLS = [
  '/auth/poll', // Long polling endpoints
  '/notifications/poll', // Notification polling
  '/analytics/stream', // Streaming endpoints
];

/**
 * Check if URL should be excluded from loading indicator
 * @param url Request URL
 * @returns true if URL should be excluded
 */
function shouldExcludeFromLoading(url: string): boolean {
  return EXCLUDED_URLS.some((excludedUrl) => url.includes(excludedUrl));
}

/**
 * Loading HTTP interceptor
 * Shows global loading indicator for HTTP requests
 * Implements delay to avoid flickering and minimum display time
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor, OnDestroy {
  private readonly loadingStateService = inject(LoadingStateService);

  // Track active requests with delayed loading
  private readonly activeRequests = new Map<HttpRequest<unknown>, Subscription>();
  private readonly delay = this.loadingStateService.getLoadingDelay();

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Skip excluded URLs
    if (shouldExcludeFromLoading(req.url)) {
      return next.handle(req);
    }

    // Create delayed loading timer
    const loadingTimer = timer(this.delay).subscribe(() => {
      this.loadingStateService.incrementLoading();
    });

    // Track this request
    this.activeRequests.set(req, loadingTimer);

    return next.handle(req).pipe(
      finalize(() => {
        // Clear timer
        const timer = this.activeRequests.get(req);
        if (timer) {
          timer.unsubscribe();
          this.activeRequests.delete(req);
        }

        // Decrement loading if it was triggered
        if (this.loadingStateService.getActiveRequestCount() > 0) {
          this.loadingStateService.decrementLoading();
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Cleanup all active timers
    this.activeRequests.forEach((timer) => timer.unsubscribe());
    this.activeRequests.clear();
  }
}

/**
 * Factory function for LoadingInterceptor
 * Required for Angular's inject()-based DI
 */
export const loadingInterceptorFactory = () => new LoadingInterceptor();
