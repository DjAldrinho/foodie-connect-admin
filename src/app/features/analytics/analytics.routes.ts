/**
 * Analytics Routes
 * Lazy-loaded routes for the Analytics module
 */

import { Routes } from '@angular/router';

export const ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./analytics-page/analytics-page.component').then(
        (m) => m.AnalyticsPageComponent
      ),
  },
];
