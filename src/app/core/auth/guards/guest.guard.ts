import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

/**
 * GuestGuard - Prevents authenticated users from accessing auth pages
 *
 * Use this guard on routes like login, register, forgot-password
 * to redirect authenticated users to the dashboard.
 *
 * @example
 * ```typescript
 * {
 *   path: 'login',
 *   component: LoginPageComponent,
 *   canActivate: [guestGuard]
 * }
 * ```
 */
export const guestGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const authService = AuthService();
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    // User is authenticated, redirect to dashboard
    router.navigate(['/dashboard'], {
      queryParams: { redirect: state.url },
    });
    return false;
  }

  // User is not authenticated, allow access
  return true;
};
