import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';

export const routes: Routes = [
  // Auth Routes (public, uses AuthLayout)
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login').then(m => m.LoginPageComponent),
        canActivate: [guestGuard],
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password').then(m => m.ForgotPasswordComponent),
        canActivate: [guestGuard],
      },
      // Redirect /auth to /auth/login
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  // Main Routes (authenticated, uses MainLayout)
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      // Dashboard route
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard').then(m => m.DashboardComponent),
      },
      // Users routes
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then(m => m.usersRoutes),
      },
      // Other feature routes will be added here
      // Redirect root to dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // 404 Wildcard Route
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
