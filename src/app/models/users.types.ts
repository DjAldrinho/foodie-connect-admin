/**
 * Users module types
 */

import type { UserRole, UserStatus } from './auth.types';

/**
 * User list item (for table/grid views)
 */
export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
}

/**
 * User statistics
 */
export interface UserStatistics {
  totalLogins: number;
  lastLoginAt?: string;
  restaurantsCreated: number;
  reviewsWritten: number;
  reportsSubmitted: number;
}

/**
 * User preferences
 */
export interface UserPreferences {
  language: string;
  notificationEmail: boolean;
  notificationPush: boolean;
  theme: 'light' | 'dark' | 'auto';
}

/**
 * User detail (full information)
 */
export interface UserDetail extends UserListItem {
  phone?: string;
  bio?: string;
  preferences: UserPreferences;
  statistics: UserStatistics;
  updatedAt: string;
}

/**
 * Restaurant summary for user detail
 */
export interface RestaurantSummary {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

/**
 * Review summary for user detail
 */
export interface ReviewSummary {
  id: string;
  restaurantName: string;
  rating: number;
  helpfulCount: number;
  createdAt: string;
}

/**
 * User activity log entry
 */
export interface UserActivity {
  id: string;
  type: 'login' | 'review' | 'photo' | 'report' | 'restaurant_created';
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * User list filters
 */
export interface UserListFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  startDate?: string;
  endDate?: string;
}

/**
 * Bulk action request
 */
export interface BulkActionRequest {
  userIds: string[];
  action: 'activate' | 'deactivate' | 'delete' | 'updateRole';
  payload?: {
    role?: UserRole;
    reason?: string;
  };
}

/**
 * Change role request
 */
export interface ChangeRoleRequest {
  role: UserRole;
  reason?: string;
}
