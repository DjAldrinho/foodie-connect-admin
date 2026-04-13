/**
 * Notifications Routes
 * Lazy-loaded routes for the Notifications module
 */

import { Routes } from '@angular/router';

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./notifications-list/notifications-list.component').then(
        (m) => m.NotificationsListComponent
      ),
  },
  {
    path: 'compose',
    loadComponent: () =>
      import('./compose-notification/compose-notification.component').then(
        (m) => m.ComposeNotificationComponent
      ),
  },
];
