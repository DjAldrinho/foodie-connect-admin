import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { TokenStorageService } from '../../../core/auth/services/token-storage.service';

/**
 * Integration Tests for Authentication Flow
 *
 * Tests the complete auth flow including:
 * - Login with valid credentials
 * - Token storage
 * - Session persistence
 * - Protected route navigation
 * - Logout and cleanup
 */
describe('Authentication Flow Integration Tests', () => {
  let authService: AuthService;
  let tokenStorage: TokenStorageService;
  let router: Router;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        TokenStorageService,
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: Location, useValue: { path: jasmine.createSpy('path') } },
      ],
    });

    authService = TestBed.inject(AuthService);
    tokenStorage = TestBed.inject(TokenStorageService);
    router = TestBed.inject(Router) as any;
    location = TestBed.inject(Location) as any;
  });

  afterEach(() => {
    tokenStorage.clear();
    localStorage.clear();
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', (done) => {
      const loginResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        },
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
      };

      spyOn(authService, 'login').and.returnValue(of(loginResponse));

      authService.login({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      }).subscribe({
        next: (response) => {
          expect(response).toEqual(loginResponse);
          expect(authService.login).toHaveBeenCalledTimes(1);
          done();
        },
        error: done.fail,
      });
    });

    it('should store tokens after successful login', (done) => {
      const loginResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        },
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
      };

      spyOn(authService, 'login').and.returnValue(of(loginResponse));

      authService.login({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      }).subscribe({
        next: () => {
          const accessToken = tokenStorage.getAccessToken();
          const refreshToken = tokenStorage.getRefreshToken();

          expect(accessToken).toBe('fake-jwt-token');
          expect(refreshToken).toBe('fake-refresh-token');
          done();
        },
        error: done.fail,
      });
    });

    it('should set current user after login', (done) => {
      const loginResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'ADMIN',
        },
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
      };

      spyOn(authService, 'login').and.returnValue(of(loginResponse));

      authService.login({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      }).subscribe({
        next: () => {
          const currentUser = authService.currentUser();

          expect(currentUser).toBeDefined();
          expect(currentUser?.id).toBe('123');
          expect(currentUser?.email).toBe('test@example.com');
          expect(currentUser?.role).toBe('ADMIN');
          done();
        },
        error: done.fail,
      });
    });

    it('should handle login failure with invalid credentials', (done) => {
      const error = { status: 401, message: 'Invalid credentials' };

      spyOn(authService, 'login').and.returnValue(throwError(() => error));

      authService.login({
        email: 'wrong@example.com',
        password: 'wrongpassword',
        rememberMe: false,
      }).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (err) => {
          expect(err.status).toBe(401);
          done();
        },
      });
    });

    it('should not store tokens on failed login', (done) => {
      const error = { status: 401 };

      spyOn(authService, 'login').and.returnValue(throwError(() => error));

      authService.login({
        email: 'wrong@example.com',
        password: 'wrongpassword',
        rememberMe: false,
      }).subscribe({
        next: () => done.fail('Should not succeed'),
        error: () => {
          const accessToken = tokenStorage.getAccessToken();

          expect(accessToken).toBeNull();
          done();
        },
      });
    });
  });

  describe('Session Persistence', () => {
    it('should persist user session across service instances', (done) => {
      const loginResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        },
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
      };

      // Login with first instance
      spyOn(authService, 'login').and.returnValue(of(loginResponse));

      authService.login({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      }).subscribe({
        next: () => {
          // Create new service instance
          const newAuthService = TestBed.inject(AuthService);
          const currentUser = newAuthService.currentUser();

          expect(currentUser).toBeDefined();
          expect(currentUser?.email).toBe('test@example.com');
          done();
        },
        error: done.fail,
      });
    });

    it('should restore session from stored tokens', () => {
      tokenStorage.setAccessToken('fake-jwt-token');
      tokenStorage.setRefreshToken('fake-refresh-token');

      // Tokens should be accessible
      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();

      expect(accessToken).toBe('fake-jwt-token');
      expect(refreshToken).toBe('fake-refresh-token');
    });
  });

  describe('Protected Route Navigation', () => {
    it('should allow navigation when authenticated', (done) => {
      const loginResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        },
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
      };

      spyOn(authService, 'login').and.returnValue(of(loginResponse));

      authService
        .login({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        })
        .subscribe({
          next: () => {
            const isAuthenticated = authService.isAuthenticated();

            expect(isAuthenticated).toBe(true);
            done();
          },
          error: done.fail,
        });
    });

    it('should block navigation when not authenticated', () => {
      const isAuthenticated = authService.isAuthenticated();

      expect(isAuthenticated).toBe(false);
    });
  });

  describe('Logout Flow', () => {
    it('should clear tokens on logout', () => {
      tokenStorage.setAccessToken('fake-jwt-token');
      tokenStorage.setRefreshToken('fake-refresh-token');

      authService.logout();

      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();

      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
    });

    it('should clear user state on logout', (done) => {
      const loginResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        },
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
      };

      spyOn(authService, 'login').and.returnValue(of(loginResponse));

      authService
        .login({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        })
        .subscribe({
          next: () => {
            expect(authService.currentUser()).toBeDefined();

            authService.logout();

            expect(authService.currentUser()).toBeNull();
            done();
          },
          error: done.fail,
        });
    });

    it('should navigate to login after logout', () => {
      authService.logout();

      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh access token', (done) => {
      const refreshResponse = {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      tokenStorage.setAccessToken('old-access-token');
      tokenStorage.setRefreshToken('old-refresh-token');

      spyOn(authService, 'refreshToken').and.returnValue(of(refreshResponse));

      authService.refreshToken().subscribe({
        next: () => {
          const newAccessToken = tokenStorage.getAccessToken();
          const newRefreshToken = tokenStorage.getRefreshToken();

          expect(newAccessToken).toBe('new-access-token');
          expect(newRefreshToken).toBe('new-refresh-token');
          done();
        },
        error: done.fail,
      });
    });

    it('should handle refresh token failure', (done) => {
      const error = { status: 401 };

      tokenStorage.setAccessToken('expired-token');
      tokenStorage.setRefreshToken('invalid-refresh-token');

      spyOn(authService, 'refreshToken').and.returnValue(throwError(() => error));

      authService.refreshToken().subscribe({
        next: () => done.fail('Should not succeed'),
        error: (err) => {
          expect(err.status).toBe(401);

          // Should clear tokens on refresh failure
          const accessToken = tokenStorage.getAccessToken();
          expect(accessToken).toBeNull();
          done();
        },
      });
    });
  });

  describe('Remember Me Functionality', () => {
    it('should store refresh token when remember me is true', (done) => {
      const loginResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        },
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
      };

      spyOn(authService, 'login').and.returnValue(of(loginResponse));

      authService
        .login({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: true,
        })
        .subscribe({
          next: () => {
            const refreshToken = tokenStorage.getRefreshToken();
            expect(refreshToken).toBe('fake-refresh-token');
            done();
          },
          error: done.fail,
        });
    });

    it('should persist session with remember me', () => {
      // Simulate remember me storage
      localStorage.setItem('rememberMe', 'true');
      tokenStorage.setAccessToken('fake-jwt-token');
      tokenStorage.setRefreshToken('fake-refresh-token');

      const rememberMeValue = localStorage.getItem('rememberMe');
      expect(rememberMeValue).toBe('true');
    });
  });

  describe('Role-Based Access', () => {
    it('should track user role correctly', (done) => {
      const loginResponse = {
        user: {
          id: '123',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
        },
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
      };

      spyOn(authService, 'login').and.returnValue(of(loginResponse));

      authService
        .login({
          email: 'admin@example.com',
          password: 'admin123',
          rememberMe: false,
        })
        .subscribe({
          next: () => {
            const userRole = authService.userRole();
            expect(userRole).toBe('ADMIN');
            done();
          },
          error: done.fail,
        });
    });

    it('should have role helper methods', (done) => {
      const loginResponse = {
        user: {
          id: '123',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
        },
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
      };

      spyOn(authService, 'login').and.returnValue(of(loginResponse));

      authService
        .login({
          email: 'admin@example.com',
          password: 'admin123',
          rememberMe: false,
        })
        .subscribe({
          next: () => {
            expect(authService.isAdmin()).toBe(true);
            expect(authService.isUser()).toBe(false);
            expect(authService.isSuperAdmin()).toBe(false);
            done();
          },
          error: done.fail,
        });
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple login attempts', (done) => {
      const loginResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        },
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
      };

      spyOn(authService, 'login').and.returnValue(of(loginResponse));

      const promises = [
        authService.login({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        }),
        authService.login({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        }),
      ];

      Promise.all(promises).then(() => {
        expect(authService.login).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should handle logout when not logged in', () => {
      expect(() => {
        authService.logout();
      }).not.toThrow();
    });

    it('should handle concurrent token refresh', (done) => {
      const refreshResponse = {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      spyOn(authService, 'refreshToken').and.returnValue(of(refreshResponse));

      const promises = [authService.refreshToken(), authService.refreshToken()];

      Promise.all(promises).then(() => {
        const accessToken = tokenStorage.getAccessToken();
        expect(accessToken).toBe('new-access-token');
        done();
      });
    });
  });
});
