/**
 * Moderation Feature Routes
 */

import { Routes } from '@angular/router';

export const moderationRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./moderation-queue/moderation-queue.component').then((m) => m.ModerationQueueComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./report-detail/report-detail.component').then((m) => m.ReportDetailComponent),
  },
];
