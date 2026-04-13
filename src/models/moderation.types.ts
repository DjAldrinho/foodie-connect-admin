/**
 * Moderation Module Types
 * Contains all types related to the moderation queue and report management
 */

/**
 * Report types that can be moderated
 */
export enum ReportType {
  USER = 'user',
  RESTAURANT = 'restaurant',
  REVIEW = 'review',
  PHOTO = 'photo',
  COMMENT = 'comment',
}

/**
 * Report status in the moderation workflow
 */
export enum ReportStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

/**
 * Priority levels for reports
 */
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ESCALATED = 'escalated',
}

/**
 * Moderation actions that can be performed
 */
export enum ModerationAction {
  APPROVE_CONTENT = 'approve_content',
  REJECT_REPORT = 'reject_report',
  DISMISS_REPORT = 'dismiss_report',
  ESCALATE = 'escalate',
}

/**
 * Base report interface
 */
export interface Report {
  id: string;
  type: ReportType;
  status: ReportStatus;
  priority: Priority;
  reportCount: number;
  reporter: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  reason: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  escalatedAt?: string;
  escalatedBy?: {
    id: string;
    name: string;
  };
}

/**
 * Report in the queue list
 */
export interface ReportListItem extends Report {
  contentPreview: {
    title?: string;
    description?: string;
    author?: string;
    thumbnail?: string;
  };
}

/**
 * Detailed report with full content
 */
export interface ReportDetail extends Report {
  content: {
    id: string;
    type: ReportType;
    // User report content
    user?: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      bio?: string;
      statistics: {
        totalLogins: number;
        lastLoginAt: string;
        restaurantsCreated: number;
        reviewsWritten: number;
        reportsSubmitted: number;
      };
      createdAt: string;
    };
    // Restaurant report content
    restaurant?: {
      id: string;
      name: string;
      description?: string;
      address: string;
      cuisine: string;
      rating: number;
      photos: string[];
      owner: {
        id: string;
        name: string;
        email: string;
      };
      createdAt: string;
    };
    // Review report content
    review?: {
      id: string;
      rating: number;
      text: string;
      photos: string[];
      reviewer: {
        id: string;
        name: string;
        avatar?: string;
      };
      restaurant: {
        id: string;
        name: string;
      };
      createdAt: string;
    };
    // Photo report content
    photo?: {
      id: string;
      url: string;
      caption?: string;
      exif?: {
        camera?: string;
        dateTaken?: string;
        location?: string;
      };
      uploader: {
        id: string;
        name: string;
        avatar?: string;
      };
      restaurant?: {
        id: string;
        name: string;
      };
      uploadedAt: string;
    };
    // Comment report content
    comment?: {
      id: string;
      text: string;
      author: {
        id: string;
        name: string;
        avatar?: string;
      };
      parentType: 'review' | 'restaurant';
      parentId: string;
      parentContent?: {
        id: string;
        title?: string;
        text?: string;
      };
      createdAt: string;
    };
  };
  actionHistory: ActionHistoryItem[];
  relatedReports: ReportListItem[];
}

/**
 * Action history item
 */
export interface ActionHistoryItem {
  id: string;
  action: ModerationAction;
  actor: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
  reason?: string;
}

/**
 * Queue query parameters
 */
export interface QueueQuery {
  page?: number;
  pageSize?: number;
  type?: ReportType;
  status?: ReportStatus;
  priority?: Priority;
  dateAfter?: string;
  dateBefore?: string;
  sortBy?: 'priority' | 'count' | 'date' | 'reporter';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Bulk action request
 */
export interface ModerationBulkActionRequest {
  action: 'approve' | 'reject' | 'dismiss' | 'escalate';
  reportIds: string[];
  reason?: string;
}

/**
 * Moderation statistics
 */
export interface ModerationStatistics {
  pendingCount: number;
  inReviewCount: number;
  escalatedCount: number;
  todayResolved: number;
  avgResolutionTime: number; // in hours
  totalReportsThisMonth: number;
}

/**
 * Bulk action response
 */
export interface BulkActionResponse {
  successCount: number;
  failedCount: number;
  failedIds: string[];
  errors: Array<{
    id: string;
    error: string;
  }>;
}
