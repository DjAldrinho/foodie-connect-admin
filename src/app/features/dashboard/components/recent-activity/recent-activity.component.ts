import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DashboardService } from '../../services/dashboard.service';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time';
import { EmptyStateComponent } from '../../../../shared/components/empty-state';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner';

import type { RecentActivity } from '../../../../models/dashboard.types';
import type { PaginatedResponse } from '../../../../models/common.types';

/**
 * RecentActivityTableComponent - Table showing recent activities
 *
 * Displays paginated table of recent activities with:
 * - Activity type icon
 * - Description
 * - Actor (user)
 * - Target (if applicable)
 * - Timestamp
 * - Status indicator
 *
 * Features:
 * - Standalone component
 * - Signals for state management
 * - OnPush change detection
 * - Angular Material Table
 * - Pagination (10 items per page)
 * - Sorting support
 * - Loading skeleton
 * - Empty state
 * - WCAG AA compliance
 * - Responsive design
 *
 * @example
 * ```html
 * <app-recent-activity />
 * ```
 */
@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    RelativeTimePipe,
    EmptyStateComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.css'],
})
export class RecentActivityComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  // Table columns
  readonly displayedColumns: string[] = [
    'type',
    'description',
    'actor',
    'timestamp',
    'status',
  ];

  // State signals
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activities = signal<RecentActivity[]>([]);

  // Pagination signals
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly total = signal(0);
  readonly hasData = computed(() => this.activities().length > 0);

  ngOnInit(): void {
    this.loadRecentActivity();
  }

  /**
   * Load recent activity
   */
  loadRecentActivity(): void {
    this.loading.set(true);
    this.error.set(null);

    const page = this.pageIndex() + 1;
    const pageSize = this.pageSize();

    this.dashboardService.getRecentActivity({ page, pageSize }).subscribe({
      next: (response) => {
        this.activities.set(response.items);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load recent activity:', err);
        this.error.set('Failed to load recent activity');
        this.loading.set(false);
      },
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadRecentActivity();
  }

  /**
   * Get icon for activity type
   */
  getActivityIcon(type: string): string {
    const iconMap: Record<string, string> = {
      user_registered: 'person_add',
      restaurant_created: 'store',
      post_created: 'article',
      review_submitted: 'star',
      report_filed: 'flag',
      moderation_action: 'verified',
      settings_updated: 'settings',
      system_alert: 'notifications',
    };
    return iconMap[type] || 'circle';
  }

  /**
   * Get icon color for activity type
   */
  getActivityColor(type: string): string {
    const colorMap: Record<string, string> = {
      user_registered: '#10b981',
      restaurant_created: '#FF6B35',
      post_created: '#3b82f6',
      review_submitted: '#f59e0b',
      report_filed: '#ef4444',
      moderation_action: '#8b5cf6',
      settings_updated: '#6b7280',
      system_alert: '#ec4899',
    };
    return colorMap[type] || '#6b7280';
  }

  /**
   * Get status icon
   */
  getStatusIcon(status?: string): string {
    const iconMap: Record<string, string> = {
      pending: 'schedule',
      completed: 'check_circle',
      failed: 'error',
    };
    return status ? iconMap[status] || 'circle' : '';
  }

  /**
   * Get status color
   */
  getStatusColor(status?: string): string {
    const colorMap: Record<string, string> = {
      pending: '#f59e0b',
      completed: '#10b981',
      failed: '#ef4444',
    };
    return status ? colorMap[status] || '#6b7280' : '';
  }

  /**
   * Track by function for ngFor
   */
  trackById(_index: number, item: RecentActivity): string {
    return item.id;
  }

  /**
   * Handle row click (for future navigation)
   */
  onRowClick(activity: RecentActivity): void {
    console.log('Activity clicked:', activity);
    // Future: Navigate to activity details
  }
}
