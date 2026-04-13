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
      // Notifications routes
      {
        path: 'notifications',
        loadChildren: () => import('./features/notifications').then(m => m.NOTIFICATIONS_ROUTES),
      },
      // Restaurants routes
      {
        path: 'restaurants',
        loadChildren: () => import('./features/restaurants/restaurants.routes').then(m => m.restaurantsRoutes),
      },
      // Moderation routes
      {
        path: 'moderation',
        loadChildren: () => import('./features/moderation/moderation.routes').then(m => m.moderationRoutes),
      },
      // Analytics routes
      {
        path: 'analytics',
        loadChildren: () => import('./features/analytics').then(m => m.ANALYTICS_ROUTES),
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
