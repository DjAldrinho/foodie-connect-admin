/**
 * Notifications Service
 * Handles all notification operations with mock data
 */

import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import type {
  Notification,
  NotificationListItem,
  NotificationDetail,
  NotificationQuery,
  NotificationStatistics,
  CreateNotificationRequest,
  BulkNotificationActionRequest,
  BulkNotificationActionResponse,
} from '../../../models/notifications.types';
import type { PaginatedResponse, PaginationParams } from '../../../models/common.types';
import {
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  NotificationTarget,
} from '../../../models/notifications.types';

/**
 * Mock notifications data (20 sample notifications)
 */
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: NotificationType.ANNOUNCEMENT,
    title: 'New Feature Available',
    message: 'We have added a new feature to manage your restaurants more efficiently.',
    priority: NotificationPriority.NORMAL,
    status: NotificationStatus.SENT,
    target: NotificationTarget.ALL_USERS,
    sentAt: new Date('2026-04-13T10:00:00'),
    createdAt: new Date('2026-04-13T09:30:00'),
    updatedAt: new Date('2026-04-13T10:00:00'),
    createdBy: 'admin@foodie.com',
    readCount: 1234,
    deliveryCount: 1500,
    failedCount: 0,
  },
  {
    id: '2',
    type: NotificationType.SYSTEM,
    title: 'Scheduled Maintenance',
    message: 'System will be under maintenance on April 15, 2026 from 2:00 AM to 4:00 AM UTC.',
    priority: NotificationPriority.HIGH,
    status: NotificationStatus.SENT,
    target: NotificationTarget.ALL_USERS,
    sentAt: new Date('2026-04-12T14:00:00'),
    createdAt: new Date('2026-04-12T13:00:00'),
    updatedAt: new Date('2026-04-12T14:00:00'),
    createdBy: 'admin@foodie.com',
    readCount: 890,
    deliveryCount: 1500,
    failedCount: 2,
  },
  {
    id: '3',
    type: NotificationType.PROMOTION,
    title: 'Special Offer: 50% Off',
    message: 'Get 50% off on your next restaurant verification. Limited time offer!',
    priority: NotificationPriority.NORMAL,
    status: NotificationStatus.SENT,
    target: NotificationTarget.ROLE,
    targetRoles: ['RESTAURANT_OWNER'],
    sentAt: new Date('2026-04-11T16:00:00'),
    createdAt: new Date('2026-04-11T15:30:00'),
    updatedAt: new Date('2026-04-11T16:00:00'),
    createdBy: 'marketing@foodie.com',
    readCount: 234,
    deliveryCount: 450,
    failedCount: 0,
  },
  {
    id: '4',
    type: NotificationType.ALERT,
    title: 'Security Alert',
    message: 'We detected unusual activity on your account. Please review your recent login history.',
    priority: NotificationPriority.URGENT,
    status: NotificationStatus.SENT,
    target: NotificationTarget.SPECIFIC_USERS,
    targetUserIds: ['user123', 'user456'],
    sentAt: new Date('2026-04-10T09:00:00'),
    createdAt: new Date('2026-04-10T08:30:00'),
    updatedAt: new Date('2026-04-10T09:00:00'),
    createdBy: 'system@foodie.com',
    readCount: 2,
    deliveryCount: 2,
    failedCount: 0,
  },
  {
    id: '5',
    type: NotificationType.INFO,
    title: 'Welcome to Foodie Connect',
    message: 'Thank you for joining Foodie Connect! Start exploring restaurants near you.',
    priority: NotificationPriority.NORMAL,
    status: NotificationStatus.SENT,
    target: NotificationTarget.ALL_USERS,
    sentAt: new Date('2026-04-09T12:00:00'),
    createdAt: new Date('2026-04-09T11:00:00'),
    updatedAt: new Date('2026-04-09T12:00:00'),
    createdBy: 'system@foodie.com',
    readCount: 567,
    deliveryCount: 800,
    failedCount: 1,
  },
  {
    id: '6',
    type: NotificationType.SUCCESS,
    title: 'Restaurant Verified!',
    message: 'Congratulations! Your restaurant has been successfully verified.',
    priority: NotificationPriority.NORMAL,
    status: NotificationStatus.SENT,
    target: NotificationTarget.ROLE,
    targetRoles: ['RESTAURANT_OWNER'],
    sentAt: new Date('2026-04-08T14:30:00'),
    createdAt: new Date('2026-04-08T13:00:00'),
    updatedAt: new Date('2026-04-08T14:30:00'),
    createdBy: 'admin@foodie.com',
    readCount: 45,
    deliveryCount: 50,
    failedCount: 0,
  },
  {
    id: '7',
    type: NotificationType.WARNING,
    title: 'Account Expiring Soon',
    message: 'Your subscription will expire in 7 days. Renew now to continue enjoying premium features.',
    priority: NotificationPriority.HIGH,
    status: NotificationStatus.SCHEDULED,
    target: NotificationTarget.SPECIFIC_USERS,
    targetUserIds: ['user789', 'user012'],
    scheduledFor: new Date('2026-04-20T10:00:00'),
    createdAt: new Date('2026-04-13T08:00:00'),
    updatedAt: new Date('2026-04-13T08:00:00'),
    createdBy: 'system@foodie.com',
    readCount: 0,
    deliveryCount: 0,
    failedCount: 0,
  },
  {
    id: '8',
    type: NotificationType.ERROR,
    title: 'Payment Failed',
    message: 'Your recent payment could not be processed. Please update your payment information.',
    priority: NotificationPriority.URGENT,
    status: NotificationStatus.PENDING,
    target: NotificationTarget.SPECIFIC_USERS,
    targetUserIds: ['user345'],
    createdAt: new Date('2026-04-13T07:00:00'),
    updatedAt: new Date('2026-04-13T07:00:00'),
    createdBy: 'billing@foodie.com',
    readCount: 0,
    deliveryCount: 0,
    failedCount: 0,
  },
  {
    id: '9',
    type: NotificationType.ANNOUNCEMENT,
    title: 'Mobile App Update',
    message: 'Version 2.5 of our mobile app is now available with exciting new features!',
    priority: NotificationPriority.NORMAL,
    status: NotificationStatus.SENT,
    target: NotificationTarget.ALL_USERS,
    sentAt: new Date('2026-04-07T11:00:00'),
    createdAt: new Date('2026-04-07T10:00:00'),
    updatedAt: new Date('2026-04-07T11:00:00'),
    createdBy: 'admin@foodie.com',
    readCount: 2345,
    deliveryCount: 3000,
    failedCount: 5,
  },
  {
    id: '10',
    type: NotificationType.PROMOTION,
    title: 'Weekend Special',
    message: 'Order this weekend and get free delivery on all orders above $20!',
    priority: NotificationPriority.LOW,
    status: NotificationStatus.SENT,
    target: NotificationTarget.ALL_USERS,
    sentAt: new Date('2026-04-06T16:00:00'),
    createdAt: new Date('2026-04-06T15:00:00'),
    updatedAt: new Date('2026-04-06T16:00:00'),
    createdBy: 'marketing@foodie.com',
    readCount: 1567,
    deliveryCount: 2500,
    failedCount: 3,
  },
];

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {

  // Signals for state management
  readonly notifications = signal<NotificationListItem[]>([]);
  readonly statistics = signal<NotificationStatistics | null>(null);

  constructor() {
    this.loadMockData();
  }

  /**
   * Load mock data
   */
  private loadMockData(): void {
    const listItems: NotificationListItem[] = MOCK_NOTIFICATIONS.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      status: n.status,
      priority: n.priority,
      target: n.target,
      scheduledFor: n.scheduledFor,
      sentAt: n.sentAt,
      createdAt: n.createdAt,
      readCount: n.readCount,
      deliveryCount: n.deliveryCount,
    }));

    this.notifications.set(listItems);
    this.statistics.set(this.calculateStatistics());
  }

  /**
   * Calculate statistics from mock data
   */
  private calculateStatistics(): NotificationStatistics {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const sentToday = MOCK_NOTIFICATIONS.filter(
      (n) => n.sentAt && n.sentAt >= today
    ).length;

    const sentThisWeek = MOCK_NOTIFICATIONS.filter(
      (n) => n.sentAt && n.sentAt >= weekAgo
    ).length;

    const sentThisMonth = MOCK_NOTIFICATIONS.filter(
      (n) => n.sentAt && n.sentAt >= monthAgo
    ).length;

    const totalSent = MOCK_NOTIFICATIONS.filter(
      (n) => n.status === NotificationStatus.SENT
    ).length;

    const totalFailed = MOCK_NOTIFICATIONS.filter(
      (n) => n.status === NotificationStatus.FAILED
    ).length;

    const totalPending = MOCK_NOTIFICATIONS.filter(
      (n) => n.status === NotificationStatus.PENDING
    ).length;

    const totalScheduled = MOCK_NOTIFICATIONS.filter(
      (n) => n.status === NotificationStatus.SCHEDULED
    ).length;

    const totalDeliveries = MOCK_NOTIFICATIONS.reduce(
      (sum, n) => sum + n.deliveryCount,
      0
    );
    const totalReads = MOCK_NOTIFICATIONS.reduce(
      (sum, n) => sum + n.readCount,
      0
    );

    const deliveryRate =
      totalDeliveries > 0 ? (totalReads / totalDeliveries) * 100 : 0;

    return {
      sentToday,
      sentThisWeek,
      sentThisMonth,
      deliveryRate: Math.round(deliveryRate * 10) / 10,
      totalSent,
      totalFailed,
      totalPending,
      totalScheduled,
    };
  }

  /**
   * Get paginated notifications list
   */
  getAll(
    pagination: PaginationParams,
    query?: NotificationQuery
  ): Observable<PaginatedResponse<NotificationListItem>> {
    let filtered = [...MOCK_NOTIFICATIONS];

    // Apply filters
    if (query) {
      if (query.type) {
        filtered = filtered.filter((n) => n.type === query.type);
      }
      if (query.status) {
        filtered = filtered.filter((n) => n.status === query.status);
      }
      if (query.priority) {
        filtered = filtered.filter((n) => n.priority === query.priority);
      }
      if (query.target) {
        filtered = filtered.filter((n) => n.target === query.target);
      }
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        filtered = filtered.filter(
          (n) =>
            n.title.toLowerCase().includes(searchLower) ||
            n.message.toLowerCase().includes(searchLower)
        );
      }
    }

    // Convert to list items
    const items: NotificationListItem[] = filtered.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      status: n.status,
      priority: n.priority,
      target: n.target,
      scheduledFor: n.scheduledFor,
      sentAt: n.sentAt,
      createdAt: n.createdAt,
      readCount: n.readCount,
      deliveryCount: n.deliveryCount,
    }));

    // Sort by created date (newest first)
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Pagination
    const { page = 1, pageSize = 25 } = pagination;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);

    const totalPages = Math.ceil(items.length / pageSize);

    return of({
      items: paginatedItems,
      total: items.length,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }).pipe(delay(300));
  }

  /**
   * Get notification by ID
   */
  getById(id: string): Observable<NotificationDetail> {
    const notification = MOCK_NOTIFICATIONS.find((n) => n.id === id);

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Add mock read/failed data
    const detail: NotificationDetail = {
      ...notification,
      readBy:
        notification.status === NotificationStatus.SENT && notification.readCount > 0
          ? [
              { userId: 'user1', readAt: new Date() },
              { userId: 'user2', readAt: new Date() },
            ].slice(0, Math.min(notification.readCount, 5))
          : [],
      failedDeliveries:
        notification.failedCount > 0
          ? [
              { userId: 'user3', error: 'User not found', failedAt: new Date() },
              { userId: 'user4', error: 'Invalid email', failedAt: new Date() },
            ].slice(0, Math.min(notification.failedCount, 5))
          : [],
    };

    return of(detail).pipe(delay(200));
  }

  /**
   * Create new notification
   */
  createNotification(
    request: CreateNotificationRequest
  ): Observable<Notification> {
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type: request.type,
      title: request.title,
      message: request.message,
      priority: request.priority,
      status: request.sendNow
        ? NotificationStatus.SENT
        : NotificationStatus.SCHEDULED,
      target: request.target,
      targetRoles: request.targetRoles,
      targetUserIds: request.targetUserIds,
      scheduledFor: request.scheduledFor,
      sentAt: request.sendNow ? new Date() : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin@foodie.com',
      readCount: 0,
      deliveryCount: request.sendNow ? 100 : 0,
      failedCount: 0,
      data: request.data,
    };

    MOCK_NOTIFICATIONS.unshift(newNotification);
    this.loadMockData();

    return of(newNotification).pipe(delay(500));
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): Observable<void> {
    const notification = MOCK_NOTIFICATIONS.find((n) => n.id === id);
    if (notification) {
      notification.readCount += 1;
      this.loadMockData();
    }
    return of(void 0).pipe(delay(200));
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<void> {
    MOCK_NOTIFICATIONS.forEach((n) => {
      if (n.status === NotificationStatus.SENT) {
        n.readCount = n.deliveryCount;
      }
    });
    this.loadMockData();
    return of(void 0).pipe(delay(300));
  }

  /**
   * Get notification statistics
   */
  getStatistics(): Observable<NotificationStatistics> {
    return of(this.statistics()!).pipe(delay(200));
  }

  /**
   * Perform bulk action on notifications
   */
  bulkAction(
    request: BulkNotificationActionRequest
  ): Observable<BulkNotificationActionResponse> {
    const response: BulkNotificationActionResponse = {
      successCount: 0,
      failedCount: 0,
      failedIds: [],
      errors: [],
    };

    request.notificationIds.forEach((id) => {
      const notification = MOCK_NOTIFICATIONS.find((n) => n.id === id);
      if (!notification) {
        response.failedCount++;
        response.failedIds.push(id);
        response.errors.push({ id, error: 'Notification not found' });
        return;
      }

      try {
        switch (request.action) {
          case 'mark_sent':
            notification.status = NotificationStatus.SENT;
            notification.sentAt = new Date();
            notification.deliveryCount = 100;
            break;
          case 'mark_failed':
            notification.status = NotificationStatus.FAILED;
            notification.failedCount++;
            break;
          case 'cancel':
            if (notification.status === NotificationStatus.SCHEDULED) {
              notification.status = NotificationStatus.PENDING;
            }
            break;
          case 'delete':
            const index = MOCK_NOTIFICATIONS.findIndex((n) => n.id === id);
            if (index !== -1) {
              MOCK_NOTIFICATIONS.splice(index, 1);
            }
            break;
        }
        notification.updatedAt = new Date();
        response.successCount++;
      } catch (error) {
        response.failedCount++;
        response.failedIds.push(id);
        response.errors.push({
          id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    this.loadMockData();
    return of(response).pipe(delay(500));
  }
}
