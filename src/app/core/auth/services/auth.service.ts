import { inject, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, tap, catchError, delay } from 'rxjs';

import { environment } from '@environments/environment';
import { TokenStorageService } from './token-storage.service';

import type {
  User,
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
} from '../../../models/auth.types';
import { UserRole, UserStatus, Permission, ROLE_PERMISSIONS } from '../../../models/auth.types';

/**
 * Authentication service with login/logout/token management
 */
export const AuthService = () => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const tokenStorage = TokenStorageService();

  // Internal state
  const currentUserSignal = signal<User | null>(tokenStorage.getUserData<User>());
  const isAuthenticatedSignal = computed(() => currentUserSignal() !== null);
  const userRoleSignal = computed(() => {
    const role = currentUserSignal()?.role;
    // Handle role as string or object
    if (typeof role === 'string') {
      return role as UserRole;
    }
    if (typeof role === 'object' && role?.name) {
      return role.name as UserRole;
    }
    return undefined;
  });
  const userPermissionsSignal = computed(() => {
    const user = currentUserSignal();
    // Get permissions from user object or derive from role
    if (user?.permissions && user.permissions.length > 0) {
      return user.permissions;
    }
    // Derive permissions from role
    const role = userRoleSignal();
    if (role && ROLE_PERMISSIONS[role]) {
      return ROLE_PERMISSIONS[role];
    }
    return [];
  });

  // Refresh token timer
  let refreshTimer: ReturnType<typeof setTimeout> | null = null;

  // Auto-initialize token refresh
  effect(() => {
    const user = currentUserSignal();
    if (user) {
      startTokenRefresh();
    } else {
      stopTokenRefresh();
    }
  });

  /**
   * Login with email and password
   */
  const login = (credentials: LoginCredentials): Observable<User> => {
    const loginUrl = `${environment.apiUrl}/auth/login`;
    console.log('🔐 Attempting login to:', loginUrl);
    console.log('📧 Credentials:', { email: credentials.email, password: '***' });

    return http
      .post<LoginResponse>(loginUrl, credentials)
      .pipe(
        tap((response) => {
          console.log('✅ Login response received:', response);
          console.log('📦 User from response:', response.user);

          tokenStorage.setAccessToken(response.accessToken);
          tokenStorage.setRefreshToken(response.refreshToken);
          tokenStorage.setUserData(response.user);
          currentUserSignal.set(response.user);

          console.log('✅ Tokens stored');
          console.log('✅ User signal set to:', response.user);
          console.log('✅ User authenticated:', currentUserSignal() !== null);
        }),
        switchMap((response) => {
          console.log('✅ Returning user from login:', response.user);
          console.log('✅ User has permissions:', response.user?.permissions || 'No permissions field');
          return of(response.user);
        }),
        catchError((error) => {
          console.error('❌ Login failed:', error);
          console.error('❌ Error status:', error.status);
          console.error('❌ Error message:', error.message);
          throw error;
        })
      );
  };

  /**
   * Logout and clear all tokens
   */
  const logout = (redirect = true): void => {
    tokenStorage.clearTokens();
    currentUserSignal.set(null);
    stopTokenRefresh();

    if (redirect) {
      router.navigate(['/auth/login']);
    }
  };

  /**
   * Refresh access token
   */
  const refreshToken = (): Observable<User> => {
    const refreshTokenValue = tokenStorage.getRefreshToken();

    if (!refreshTokenValue) {
      logout();
      throw new Error('No refresh token available');
    }

    return http
      .post<RefreshTokenResponse>(`${environment.apiUrl}/auth/refresh`, {
        refreshToken: refreshTokenValue,
      })
      .pipe(
        tap((response) => {
          console.log('✅ Refresh response received:', response);
          tokenStorage.setAccessToken(response.accessToken);
          tokenStorage.setRefreshToken(response.refreshToken);
          console.log('✅ Tokens refreshed successfully');
        }),
        switchMap(() => {
          // Fetch fresh user data
          console.log('🔄 Fetching fresh user data from /users/me');
          return http.get<User>(`${environment.apiUrl}/users/me`).pipe(
            tap((user) => {
              console.log('✅ Fresh user data received:', user);
              tokenStorage.setUserData(user);
              currentUserSignal.set(user);
              console.log('✅ User data updated in storage and signal');
            })
          );
        }),
        catchError((error) => {
          console.error('Token refresh failed:', error);
          logout();
          throw error;
        })
      );
  };

  /**
   * Get access token
   */
  const getAccessToken = (): string | null => {
    return tokenStorage.getAccessToken();
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = (): boolean => {
    return isAuthenticatedSignal();
  };

  /**
   * Get current user
   */
  const currentUser = (): User | null => {
    return currentUserSignal();
  };

  /**
   * Get user role
   */
  const userRole = (): UserRole | undefined => {
    return userRoleSignal();
  };

  /**
   * Get user permissions
   */
  const userPermissions = (): string[] => {
    return userPermissionsSignal();
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role: UserRole): boolean => {
    return userRoleSignal() === role;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    const currentRole = userRoleSignal();
    return currentRole !== undefined && roles.includes(currentRole);
  };

  /**
   * Check if user has specific permission
   */
  const hasPermission = (permission: string): boolean => {
    return userPermissionsSignal().includes(permission as never);
  };

  /**
   * Check if user has all specified permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    const userPerms = userPermissionsSignal();
    return permissions.every((p) => userPerms.includes(p as never));
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    const userPerms = userPermissionsSignal();
    return permissions.some((p) => userPerms.includes(p as never));
  };

  /**
   * Start automatic token refresh
   */
  const startTokenRefresh = (): void => {
    stopTokenRefresh();

    const timeUntilExpiry = tokenStorage.getTimeUntilExpiry();
    const refreshBeforeSeconds = environment.settings.tokenRefreshBeforeMinutes * 60;
    const refreshDelay = Math.max(0, timeUntilExpiry - refreshBeforeSeconds) * 1000;

    if (refreshDelay > 0) {
      refreshTimer = setTimeout(() => {
        refreshToken().subscribe({
          error: () => {
            // Logout already handled in refreshToken
          },
        });
      }, refreshDelay);
    }
  };

  /**
   * Stop automatic token refresh
   */
  const stopTokenRefresh = (): void => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
  };

  return {
    // Signals
    isAuthenticated: isAuthenticatedSignal,
    currentUser: currentUserSignal,
    userRole: userRoleSignal,
    userPermissions: userPermissionsSignal,

    // Methods
    login,
    logout,
    refreshToken,
    getAccessToken,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  };
};
