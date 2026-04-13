/**
 * Analytics Service
 * Handles all analytics operations with mock data
 */

import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import type {
  UsersAnalytics,
  ContentAnalytics,
  RestaurantAnalytics,
  SearchAnalytics,
  TimeSeriesData,
  AnalyticsQuery,
  AnalyticsSummary,
} from '../../../models/analytics.types';
import type { DateRange } from '../../../models/analytics.types';

/**
 * Mock analytics data
 */
const MOCK_USERS_ANALYTICS: UsersAnalytics = {
  totalUsers: 15234,
  activeUsers: 12456,
  inactiveUsers: 2778,
  newSignups: 234,
  signupsTrend: generateMockTimeSeries(30, 50, 200),
  retentionRate: 78.5,
  activeVsInactive: {
    active: 12456,
    inactive: 2778,
  },
};

const MOCK_CONTENT_ANALYTICS: ContentAnalytics = {
  totalPosts: 45678,
  totalReviews: 34521,
  totalPhotos: 123456,
  postsTrend: generateMockTimeSeries(30, 800, 1500),
  engagementRate: 12.5,
  topPosts: [
    {
      id: '1',
      title: 'Amazing paella at this hidden gem!',
      type: 'post',
      engagement: 1234,
      likes: 856,
      comments: 234,
      shares: 144,
    },
    {
      id: '2',
      title: 'Best tacos in town',
      type: 'review',
      engagement: 987,
      likes: 678,
      comments: 189,
      shares: 120,
    },
    {
      id: '3',
      title: 'Incredible food presentation',
      type: 'photo',
      engagement: 876,
      likes: 654,
      comments: 145,
      shares: 77,
    },
  ],
};

const MOCK_RESTAURANT_ANALYTICS: RestaurantAnalytics = {
  totalRestaurants: 3456,
  verifiedRestaurants: 2345,
  byCity: [
    { city: 'Madrid', count: 567, percentage: 16.4 },
    { city: 'Barcelona', count: 456, percentage: 13.2 },
    { city: 'Valencia', count: 345, percentage: 10.0 },
    { city: 'Seville', count: 234, percentage: 6.8 },
    { city: 'Bilbao', count: 189, percentage: 5.5 },
  ],
  topRated: [
    {
      id: '1',
      name: 'El Celler de Can Roca',
      city: 'Girona',
      rating: 4.9,
      reviewCount: 1234,
    },
    {
      id: '2',
      name: 'Disfrutar',
      city: 'Barcelona',
      rating: 4.8,
      reviewCount: 987,
    },
    {
      id: '3',
      name: 'DiverXO',
      city: 'Madrid',
      rating: 4.8,
      reviewCount: 876,
    },
  ],
  reviewsDistribution: {
    5: 15678,
    4: 9876,
    3: 4532,
    2: 2345,
    1: 1090,
  },
};

const MOCK_SEARCH_ANALYTICS: SearchAnalytics = {
  totalSearches: 234567,
  topSearches: [
    { term: 'paella', count: 12345, trend: 'up' },
    { term: 'tacos', count: 9876, trend: 'up' },
    { term: 'sushi', count: 8765, trend: 'stable' },
    { term: 'pizza', count: 7654, trend: 'down' },
    { term: 'hamburguesa', count: 6543, trend: 'up' },
  ],
  noResultsSearches: [
    { term: 'comida vegana', count: 543, trend: 'up' },
    { term: 'restaurante italiano barato', count: 432, trend: 'stable' },
    { term: 'comida sin gluten', count: 321, trend: 'up' },
  ],
  searchVolume: generateMockTimeSeries(30, 5000, 10000),
};

/**
 * Generate mock time series data
 */
function generateMockTimeSeries(days: number, min: number, max: number): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date,
      value: Math.floor(Math.random() * (max - min + 1)) + min,
      label: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    });
  }

  return data;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  // Signals for state management
  readonly usersAnalytics = signal<UsersAnalytics | null>(null);
  readonly contentAnalytics = signal<ContentAnalytics | null>(null);
  readonly restaurantAnalytics = signal<RestaurantAnalytics | null>(null);
  readonly searchAnalytics = signal<SearchAnalytics | null>(null);

  constructor() {
    this.loadMockData();
  }

  /**
   * Load mock data
   */
  private loadMockData(): void {
    this.usersAnalytics.set(MOCK_USERS_ANALYTICS);
    this.contentAnalytics.set(MOCK_CONTENT_ANALYTICS);
    this.restaurantAnalytics.set(MOCK_RESTAURANT_ANALYTICS);
    this.searchAnalytics.set(MOCK_SEARCH_ANALYTICS);
  }

  /**
   * Get users analytics
   */
  getUsersAnalytics(query: AnalyticsQuery): Observable<UsersAnalytics> {
    return of(MOCK_USERS_ANALYTICS).pipe(delay(300));
  }

  /**
   * Get content analytics
   */
  getContentAnalytics(query: AnalyticsQuery): Observable<ContentAnalytics> {
    return of(MOCK_CONTENT_ANALYTICS).pipe(delay(300));
  }

  /**
   * Get restaurant analytics
   */
  getRestaurantAnalytics(query: AnalyticsQuery): Observable<RestaurantAnalytics> {
    return of(MOCK_RESTAURANT_ANALYTICS).pipe(delay(300));
  }

  /**
   * Get search analytics
   */
  getSearchAnalytics(query: AnalyticsQuery): Observable<SearchAnalytics> {
    return of(MOCK_SEARCH_ANALYTICS).pipe(delay(300));
  }

  /**
   * Get analytics summary for dashboard
   */
  getSummary(query: AnalyticsQuery): Observable<AnalyticsSummary> {
    const summary: AnalyticsSummary = {
      period: this.getPeriodLabel(query.dateRange),
      users: {
        total: MOCK_USERS_ANALYTICS.totalUsers,
        growth: 12.5,
      },
      content: {
        total: MOCK_CONTENT_ANALYTICS.totalPosts,
        growth: 8.3,
      },
      restaurants: {
        total: MOCK_RESTAURANT_ANALYTICS.totalRestaurants,
        growth: 6.7,
      },
      searches: {
        total: MOCK_SEARCH_ANALYTICS.totalSearches,
        growth: 15.2,
      },
    };

    return of(summary).pipe(delay(200));
  }

  /**
   * Export analytics data
   */
  exportData(request: {
    type: 'users' | 'content' | 'restaurants' | 'search';
    format: 'csv' | 'json' | 'xlsx';
    dateRange: DateRange;
  }): Observable<Blob> {
    // Mock export - in real implementation would generate actual file
    const mockData = {
      exportedAt: new Date(),
      type: request.type,
      format: request.format,
      dateRange: request.dateRange,
    };

    const json = JSON.stringify(mockData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    return of(blob).pipe(delay(500));
  }

  /**
   * Get period label
   */
  private getPeriodLabel(dateRange: DateRange): string {
    const labels: Record<DateRange, string> = {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days',
      '1y': 'Last year',
      'all': 'All time',
    };

    return labels[dateRange] || dateRange;
  }
}
