import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { UserRole } from '../../../models/auth.types';

/**
 * Route configuration for role-based access
 */
interface RouteConfig {
  roles?: UserRole[];
  permissions?: string[];
  requireAll?: boolean; // For permissions: true = require all, false = require any
}

/**
 * Authentication guard
 * Protects routes that require authentication
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> => {
  const router = inject(Router);
  const authService = AuthService();

  // Check if user is authenticated
  console.log('[AuthGuard] Checking authentication for:', state.url);
  console.log('[AuthGuard] isAuthenticated:', authService.isAuthenticated());

  if (!authService.isAuthenticated()) {
    console.warn('[AuthGuard] User not authenticated, redirecting to login');
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return of(false);
  }

  // Get route configuration
  const routeConfig = route.data as RouteConfig;

  // Check role-based access
  if (routeConfig?.roles && routeConfig.roles.length > 0) {
    const hasRole = authService.hasAnyRole(routeConfig.roles);

    if (!hasRole) {
      console.warn(
        `[AuthGuard] User lacks required role. Required: ${routeConfig.roles.join(', ')}`
      );
      router.navigate(['/unauthorized']);
      return of(false);
    }
  }

  // Check permission-based access
  if (routeConfig?.permissions && routeConfig.permissions.length > 0) {
    const requireAll = routeConfig.requireAll ?? true;
    const hasPermission = requireAll
      ? authService.hasAllPermissions(routeConfig.permissions)
      : authService.hasAnyPermission(routeConfig.permissions);

    if (!hasPermission) {
      console.warn(
        `[AuthGuard] User lacks required permissions. Required: ${routeConfig.permissions.join(', ')}`
      );
      router.navigate(['/unauthorized']);
      return of(false);
    }
  }

  console.log('[AuthGuard] ✅ Access granted to:', state.url);
  return of(true);
};

/**
 * Admin-only guard
 * Protects routes that require admin role (ADMIN or SUPER_ADMIN)
 */
export const adminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> => {
  const router = inject(Router);
  const authService = AuthService();

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return of(false);
  }

  const hasAdminRole = authService.hasAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  if (!hasAdminRole) {
    console.warn('[AdminGuard] User is not an admin');
    router.navigate(['/unauthorized']);
    return of(false);
  }

  return of(true);
};

/**
 * Super admin only guard
 * Protects routes that require super admin role
 */
export const superAdminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> => {
  const router = inject(Router);
  const authService = AuthService();

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return of(false);
  }

  const isSuperAdmin = authService.hasRole(UserRole.SUPER_ADMIN);

  if (!isSuperAdmin) {
    console.warn('[SuperAdminGuard] User is not a super admin');
    router.navigate(['/unauthorized']);
    return of(false);
  }

  return of(true);
};
