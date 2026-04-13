/**
 * Notification Types
 * Type definitions for the Notifications Module
 */

/**
 * Notification type enumeration
 */
export enum NotificationType {
  SYSTEM = 'system',
  ANNOUNCEMENT = 'announcement',
  PROMOTION = 'promotion',
  ALERT = 'alert',
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

/**
 * Notification status enumeration
 */
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  SCHEDULED = 'scheduled',
}

/**
 * Notification priority enumeration
 */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Notification target audience enumeration
 */
export enum NotificationTarget {
  ALL_USERS = 'all_users',
  ROLE = 'role',
  SPECIFIC_USERS = 'specific_users',
}

/**
 * Main Notification interface
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  target: NotificationTarget;
  targetRoles?: string[];
  targetUserIds?: string[];
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  readCount: number;
  deliveryCount: number;
  failedCount: number;
  data?: Record<string, unknown>;
}

/**
 * Notification List Item (for table views)
 */
export interface NotificationListItem {
  id: string;
  type: NotificationType;
  title: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  target: NotificationTarget;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
  readCount: number;
  deliveryCount: number;
}

/**
 * Notification detail view
 */
export interface NotificationDetail extends Notification {
  readBy?: Array<{
    userId: string;
    readAt: Date;
  }>;
  failedDeliveries?: Array<{
    userId: string;
    error: string;
    failedAt: Date;
  }>;
}

/**
 * Notification statistics
 */
export interface NotificationStatistics {
  sentToday: number;
  sentThisWeek: number;
  sentThisMonth: number;
  deliveryRate: number;
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  totalScheduled: number;
}

/**
 * Notification filters for queries
 */
export interface NotificationQuery {
  type?: NotificationType;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  target?: NotificationTarget;
  dateAfter?: string;
  dateBefore?: string;
  search?: string;
}

/**
 * Create notification request
 */
export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  target: NotificationTarget;
  targetRoles?: string[];
  targetUserIds?: string[];
  scheduledFor?: Date;
  sendNow?: boolean;
  data?: Record<string, unknown>;
}

/**
 * Bulk notification action request
 */
export interface BulkNotificationActionRequest {
  action: 'mark_sent' | 'mark_failed' | 'cancel' | 'delete';
  notificationIds: string[];
}

/**
 * Bulk notification action response
 */
export interface BulkNotificationActionResponse {
  successCount: number;
  failedCount: number;
  failedIds: string[];
  errors: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * Paginated notification response
 */
export interface NotificationPaginatedResponse {
  items: NotificationListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
