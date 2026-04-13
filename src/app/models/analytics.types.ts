/**
 * Analytics Types
 * Type definitions for the Analytics Module
 */

/**
 * Date range for analytics queries
 */
export type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

/**
 * Analytics data point for charts
 */
export interface DataPoint {
  label: string;
  value: number;
  date?: Date;
}

/**
 * Time series data for line/bar charts
 */
export interface TimeSeriesData {
  date: Date;
  value: number;
  label?: string;
}

/**
 * Users analytics data
 */
export interface UsersAnalytics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newSignups: number;
  signupsTrend: TimeSeriesData[];
  retentionRate: number;
  activeVsInactive: {
    active: number;
    inactive: number;
  };
}

/**
 * Content analytics data
 */
export interface ContentAnalytics {
  totalPosts: number;
  totalReviews: number;
  totalPhotos: number;
  postsTrend: TimeSeriesData[];
  engagementRate: number;
  topPosts: TopContentItem[];
}

/**
 * Restaurant analytics data
 */
export interface RestaurantAnalytics {
  totalRestaurants: number;
  verifiedRestaurants: number;
  byCity: CityAnalytics[];
  topRated: TopRestaurant[];
  reviewsDistribution: ReviewsRatingDistribution;
}

/**
 * Search analytics data
 */
export interface SearchAnalytics {
  totalSearches: number;
  topSearches: TopSearchTerm[];
  noResultsSearches: TopSearchTerm[];
  searchVolume: TimeSeriesData[];
}

/**
 * City analytics
 */
export interface CityAnalytics {
  city: string;
  count: number;
  percentage: number;
}

/**
 * Top content item
 */
export interface TopContentItem {
  id: string;
  title: string;
  type: 'post' | 'review' | 'photo';
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
}

/**
 * Top restaurant
 */
export interface TopRestaurant {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviewCount: number;
}

/**
 * Rating distribution
 */
export interface ReviewsRatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

/**
 * Top search term
 */
export interface TopSearchTerm {
  term: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Analytics query parameters
 */
export interface AnalyticsQuery {
  dateRange: DateRange;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Chart configuration
 */
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  title: string;
  data: number[] | TimeSeriesData[];
  labels?: string[];
  colors?: string[];
  options?: Record<string, unknown>;
}

/**
 * Export data request
 */
export interface ExportDataRequest {
  type: 'users' | 'content' | 'restaurants' | 'search';
  format: 'csv' | 'json' | 'xlsx';
  dateRange: DateRange;
}

/**
 * Analytics summary (for dashboard widgets)
 */
export interface AnalyticsSummary {
  period: string;
  users: {
    total: number;
    growth: number;
  };
  content: {
    total: number;
    growth: number;
  };
  restaurants: {
    total: number;
    growth: number;
  };
  searches: {
    total: number;
    growth: number;
  };
}
