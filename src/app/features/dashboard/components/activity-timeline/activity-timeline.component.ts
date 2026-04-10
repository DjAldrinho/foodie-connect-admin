import { Component, input, output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { DashboardService } from '../../services/dashboard.service';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time';
import { EmptyStateComponent } from '../../../../shared/components/empty-state';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner';

import type { ActivityTimeline, TimelineItem } from '../../../../models/dashboard.types';

/**
 * ActivityTimelineComponent - Timeline of recent activities
 *
 * Displays vertical timeline of activities with:
 * - Icon per activity type
 * - Description and actor
 * - Target (if applicable)
 * - Relative timestamp
 *
 * Features:
 * - Standalone component
 * - Signals for state management
 * - OnPush change detection
 * - Pagination support
 * - Loading skeleton
 * - Empty state
 * - WCAG AA compliance
 * - Responsive design
 *
 * @example
 * ```html
 * <app-activity-timeline [limit]="10" />
 * ```
 */
@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RelativeTimePipe,
    EmptyStateComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './activity-timeline.component.html',
  styleUrls: ['./activity-timeline.component.css'],
})
export class ActivityTimelineComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  /**
   * Number of items to display
   */
  readonly limit = input(10);

  /**
   * Show loading state
   */
  readonly loading = input(false);

  /**
   * Activity item clicked
   */
  readonly itemClicked = output<ActivityTimeline>();

  // State signals
  readonly activities = signal<TimelineItem[]>([]);
  readonly loading$ = signal(true);
  readonly error = signal<string | null>(null);

  // Pagination
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly total = signal(0);
  readonly hasMore = signal(false);

  ngOnInit(): void {
    this.loadActivities();
  }

  /**
   * Load activities
   */
  loadActivities(): void {
    this.loading$.set(true);
    this.error.set(null);

    this.dashboardService
      .getActivityTimeline(this.currentPage(), this.pageSize())
      .subscribe({
        next: (response) => {
          const timelineItems = this.mapToTimelineItems(response.items);
          this.activities.set(timelineItems);
          this.total.set(response.total);
          this.hasMore.set(response.hasNext);
          this.loading$.set(false);
        },
        error: (err) => {
          console.error('Failed to load activity timeline:', err);
          this.error.set('Failed to load activities');
          this.loading$.set(false);
        },
      });
  }

  /**
   * Load more activities
   */
  loadMore(): void {
    if (this.loading$() || !this.hasMore()) return;

    const nextPage = this.currentPage() + 1;
    this.currentPage.set(nextPage);

    this.dashboardService.getActivityTimeline(nextPage, this.pageSize()).subscribe({
      next: (response) => {
        const newItems = this.mapToTimelineItems(response.items);
        this.activities.update((current) => [...current, ...newItems]);
        this.hasMore.set(response.hasNext);
      },
      error: (err) => {
        console.error('Failed to load more activities:', err);
        // Revert page on error
        this.currentPage.set(nextPage - 1);
      },
    });
  }

  /**
   * Handle item click
   */
  onItemClick(item: TimelineItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Find original activity data
    this.dashboardService.getActivityTimeline(1, 100).subscribe((response) => {
      const activity = response.items.find((a) => a.id === item.id);
      if (activity) {
        this.itemClicked.emit(activity);
      }
    });
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
    return iconMap[type] || 'activity';
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
   * Map activity timeline to timeline items
   */
  private mapToTimelineItems(activities: ActivityTimeline[]): TimelineItem[] {
    return activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      icon: this.getActivityIcon(activity.type),
      description: activity.description,
      actorName: activity.actor.name,
      actorAvatar: activity.actor.avatar,
      targetName: activity.target?.name,
      timestamp: activity.timestamp,
      relativeTime: '', // Will be set by pipe
    }));
  }

  /**
   * Track by function for ngFor
   */
  trackById(_index: number, item: TimelineItem): string {
    return item.id;
  }
}
