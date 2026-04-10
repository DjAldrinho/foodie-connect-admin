/**
 * Dashboard module type definitions
 *
 * This file contains all types related to the dashboard feature
 * including metrics, activities, ratings, and trends.
 */

/**
 * Dashboard metrics summary
 */
export interface DashboardMetrics {
  totalUsers: number;
  totalRestaurants: number;
  totalPosts: number;
  averageRating: number;
  trends: MetricTrends;
}

/**
 * Metric trend data showing changes over time
 */
export interface MetricTrends {
  users: TrendData;
  restaurants: TrendData;
  posts: TrendData;
  ratings: TrendData;
}

/**
 * Individual trend metric with comparison data
 */
export interface TrendData {
  current: number;
  previous: number;
  change: number; // percentage change
  period: 'daily' | 'weekly' | 'monthly';
}

/**
 * Activity timeline event
 */
export interface ActivityTimeline {
  id: string;
  type: ActivityType;
  description: string;
  actor: ActivityActor;
  target?: ActivityTarget;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Activity type enumeration
 */
export type ActivityType =
  | 'user_registered'
  | 'restaurant_created'
  | 'post_created'
  | 'review_submitted'
  | 'report_filed'
  | 'moderation_action'
  | 'settings_updated'
  | 'system_alert';

/**
 * Actor who performed the activity
 */
export interface ActivityActor {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

/**
 * Target of the activity (optional)
 */
export interface ActivityTarget {
  type: 'user' | 'restaurant' | 'post' | 'review' | 'report';
  id: string;
  name: string;
}

/**
 * Rating distribution data
 */
export interface RatingDistribution {
  distribution: RatingSegment[];
  totalRatings: number;
  averageRating: number;
}

/**
 * Individual rating segment
 */
export interface RatingSegment {
  stars: 1 | 2 | 3 | 4 | 5;
  count: number;
  percentage: number;
}

/**
 * Recent activity table item
 */
export interface RecentActivity {
  id: string;
  type: ActivityType;
  description: string;
  actor: ActivityActor;
  target?: ActivityTarget;
  timestamp: string;
  status?: 'pending' | 'completed' | 'failed';
}

/**
 * Metric card data structure
 */
export interface MetricCardData {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    period: string;
  };
  subtitle?: string;
  route?: string; // navigation route on click
}

/**
 * Activity timeline item for component
 */
export interface TimelineItem {
  id: string;
  type: ActivityType;
  icon: string;
  description: string;
  actorName: string;
  actorAvatar?: string;
  targetName?: string;
  timestamp: string;
  relativeTime: string;
}
