import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * URLs that should bypass authentication
 */
const BYPASS_URLS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
];

/**
 * Check if URL should bypass authentication
 * @param url Request URL
 * @returns true if URL should bypass auth
 */
function shouldBypassAuth(url: string): boolean {
  return BYPASS_URLS.some((bypassUrl) => url.includes(bypassUrl));
}

/**
 * Token refresh state
 */
const isRefreshing$ = new BehaviorSubject<boolean>(false);
const refreshTokenSubject$ = new BehaviorSubject<boolean>(false);

/**
 * Authentication HTTP interceptor function
 * Adds JWT token to requests and handles 401 unauthorized responses
 * Implements token refresh logic with request queue
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = AuthService();

  // Clone request and add auth header if token exists
  let authReq = req;

  if (!shouldBypassAuth(req.url)) {
    const token = authService.getAccessToken();
    if (token) {
      authReq = addTokenHeader(req, token);
    }
  }

  // Handle request with error catching
  return next(authReq).pipe(
    catchError((error) => {
      // Handle 401 unauthorized responses
      if (
        error instanceof HttpErrorResponse &&
        error.status === HttpStatusCode.Unauthorized &&
        !shouldBypassAuth(req.url)
      ) {
        return handle401Error(authReq, next, authService);
      }

      return throwError(() => error);
    })
  );
};

/**
 * Add authorization header to request
 * @param request Original request
 * @param token JWT token
 * @returns Request with auth header
 */
function addTokenHeader(
  request: HttpRequest<unknown>,
  token: string
): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Handle 401 unauthorized errors
 * Attempts to refresh token and retry original request
 * @param request Original request that failed
 * @param next Next handler
 * @param authService Auth service instance
 * @returns Observable with retried request
 */
function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: ReturnType<typeof AuthService>
) {
  // If already refreshing, wait for refresh to complete
  if (isRefreshing$.value) {
    return refreshTokenSubject$.pipe(
      filter((isRefreshed) => isRefreshed),
      take(1),
      switchMap(() => {
        // Retry original request with new token
        const token = authService.getAccessToken();
        if (token) {
          return next(addTokenHeader(request, token));
        }
        return throwError(() => new Error('No access token after refresh'));
      })
    );
  } else {
    // Start token refresh
    isRefreshing$.next(true);
    refreshTokenSubject$.next(false);

    return authService.refreshToken().pipe(
      switchMap(() => {
        // Token refreshed successfully
        isRefreshing$.next(false);
        refreshTokenSubject$.next(true);

        // Retry original request with new token
        const token = authService.getAccessToken();
        if (token) {
          return next(addTokenHeader(request, token));
        }

        return throwError(() => new Error('No access token after refresh'));
      }),
      catchError((error) => {
        // Token refresh failed
        isRefreshing$.next(false);
        refreshTokenSubject$.next(false);

        // Logout already handled in authService.refreshToken()
        return throwError(() => error);
      })
    );
  }
}
