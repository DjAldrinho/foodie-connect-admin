/**
 * Notifications List Component
 * Main component for displaying and managing notifications
 */

import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NotificationsService } from '../services/notifications.service';
import { ToastNotificationService } from '../../../core/services/toast-notification.service';

import type {
  NotificationListItem,
  NotificationQuery,
  BulkNotificationActionRequest,
  NotificationStatistics,
} from '../../../models/notifications.types';
import type { PaginatedResponse } from '../../../models/common.types';
import { PaginationParams } from '../../../models/common.types';
import {
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  NotificationTarget,
} from '../../../models/notifications.types';

/**
 * Notifications List Component
 *
 * Displays a paginated, filterable list of notifications.
 * Supports bulk actions, auto-refresh, and real-time statistics.
 */
@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsListComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly router = inject(Router);

  // Type assertion for toast service
  private readonly toast = this.toastService as unknown as {
    success: (message: string) => void;
    error: (message: string) => void;
  };

  // Signals
  readonly notifications = signal<NotificationListItem[]>([]);
  readonly statistics = signal<NotificationStatistics | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly errorMessage = signal('');

  // Filter and pagination state
  readonly filters = signal<Partial<NotificationQuery>>({
    type: undefined,
    status: undefined,
    priority: undefined,
  });

  readonly pagination = signal<PaginationParams>({
    page: 1,
    pageSize: 25,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  readonly totalNotifications = signal(0);
  readonly totalPages = signal(0);

  // Computed properties
  readonly selectedCount = computed(() => 0); // TODO: Implement selection
  readonly hasNext = computed(() => this.pagination().page < this.totalPages());
  readonly hasPrevious = computed(() => this.pagination().page > 1);

  // Filter options
  readonly notificationTypes = Object.values(NotificationType);
  readonly notificationStatuses = Object.values(NotificationStatus);
  readonly priorities = Object.values(NotificationPriority);
  readonly targets = Object.values(NotificationTarget);

  /**
   * Initialize component and load data
   */
  ngOnInit(): void {
    this.loadNotifications();
    this.loadStatistics();
  }

  /**
   * Load notifications with current filters and pagination
   */
  private loadNotifications(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    const query: NotificationQuery = {
      ...this.filters(),
    };

    this.notificationsService.getAll(this.pagination(), query).subscribe({
      next: (response: PaginatedResponse<NotificationListItem>) => {
        this.notifications.set(response.items);
        this.totalNotifications.set(response.total);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.hasError.set(true);
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
        this.toast.error('Failed to load notifications');
      },
    });
  }

  /**
   * Load notification statistics
   */
  private loadStatistics(): void {
    this.notificationsService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
      },
      error: () => {
        // Don't show error for stats failure, just keep null
      },
    });
  }

  /**
   * Apply a filter
   */
  applyFilter(type: keyof NotificationQuery, value: any): void {
    this.filters.update((current) => ({
      ...current,
      [type]: value,
    }));
    this.pagination.update((current) => ({ ...current, page: 1 }));
    this.loadNotifications();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filters.set({
      type: undefined,
      status: undefined,
      priority: undefined,
    });
    this.pagination.update((current) => ({ ...current, page: 1 }));
    this.loadNotifications();
  }

  /**
   * Change page
   */
  changePage(page: number): void {
    this.pagination.update((current) => ({ ...current, page }));
    this.loadNotifications();
  }

  /**
   * Navigate to notification detail
   */
  navigateToNotification(id: string): void {
    this.router.navigate(['/notifications', id]);
  }

  /**
   * Navigate to compose notification
   */
  navigateToCompose(): void {
    this.router.navigate(['/notifications', 'compose']);
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.toast.success('All notifications marked as read');
        this.loadNotifications();
        this.loadStatistics();
      },
      error: () => {
        this.toast.error('Failed to mark all as read');
      },
    });
  }

  /**
   * Refresh notifications
   */
  refreshNotifications(): void {
    this.loadNotifications();
    this.loadStatistics();
  }

  /**
   * Track notifications by ID for performance
   */
  trackNotification(index: number, notification: NotificationListItem): string {
    return notification.id;
  }

  /**
   * Get notification type display name
   */
  getTypeDisplayName(type: NotificationType): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  }

  /**
   * Get status display name
   */
  getStatusDisplayName(status: NotificationStatus): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  }

  /**
   * Get priority display name
   */
  getPriorityDisplayName(priority: NotificationPriority): string {
    return priority.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  }
}
