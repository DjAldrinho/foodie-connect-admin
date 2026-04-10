import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer, switchMap, shareReplay, map } from 'rxjs';

import { environment } from '@environments/environment';
import { ApiCacheService } from '../../../core/services/api-cache.service';
import { ToastNotificationService } from '../../../core/services/toast-notification.service';

import type {
  DashboardMetrics,
  ActivityTimeline,
  RatingDistribution,
  RecentActivity,
  TimelineItem,
  MetricCardData,
} from '../../../models/dashboard.types';
import type { PaginatedResponse, PaginationParams } from '../../../models/common.types';

/**
 * DashboardService - Dashboard data operations
 *
 * Provides methods for fetching dashboard metrics, activity timeline,
 * rating distribution, and recent activity data.
 *
 * Features:
 * - Caching with 5-minute TTL
 * - Mock data support (API endpoints not yet implemented)
 * - Error handling with toast notifications
 * - Observable return types
 *
 * Cache Keys:
 * - dashboard:metrics
 * - dashboard:timeline
 * - dashboard:ratings
 * - dashboard:recent
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly cacheService = inject(ApiCacheService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly apiUrl = environment.apiUrl;

  // Cache TTL: 5 minutes
  private readonly CACHE_TTL = 5 * 60 * 1000;

  /**
   * Get dashboard metrics
   * Returns: Total users, restaurants, posts, average rating with trends
   */
  getMetrics(): Observable<DashboardMetrics> {
    const cacheKey = 'dashboard:metrics';

    // Try cache first
    const cached = this.cacheService.get<DashboardMetrics>(cacheKey);
    if (cached) {
      return of(cached);
    }

    // Using mock data for now - API endpoint doesn't exist yet
    const mockData = this.getMockMetrics();
    this.cacheService.set(cacheKey, mockData, this.CACHE_TTL);

    return of(mockData);

    // Real implementation (when API is ready):
    // return this.http.get<ApiResponse<DashboardMetrics>>(`${this.apiUrl}/dashboard/metrics`).pipe(
    //   map(response => response.data),
    //   tap(data => this.cacheService.set(cacheKey, data, this.CACHE_TTL)),
    //   catchError(error => {
    //     this.toastService.showError('Failed to load dashboard metrics');
    //     return throwError(() => error);
    //   })
    // );
  }

  /**
   * Get activity timeline
   * Parameters: page (default: 1), pageSize (default: 20)
   * Returns: Paginated list of activities with actors and targets
   */
  getActivityTimeline(
    page = 1,
    pageSize = 20
  ): Observable<PaginatedResponse<ActivityTimeline>> {
    const cacheKey = `dashboard:timeline:${page}:${pageSize}`;

    // Try cache first
    const cached = this.cacheService.get<PaginatedResponse<ActivityTimeline>>(cacheKey);
    if (cached) {
      return of(cached);
    }

    // Using mock data for now
    const mockData = this.getMockActivityTimeline(page, pageSize);
    this.cacheService.set(cacheKey, mockData, this.CACHE_TTL);

    return of(mockData);
  }

  /**
   * Get rating distribution
   * Returns: Distribution of ratings (1-5 stars) with counts and percentages
   */
  getRatingDistribution(): Observable<RatingDistribution> {
    const cacheKey = 'dashboard:ratings';

    // Try cache first
    const cached = this.cacheService.get<RatingDistribution>(cacheKey);
    if (cached) {
      return of(cached);
    }

    // Using mock data for now
    const mockData = this.getMockRatingDistribution();
    this.cacheService.set(cacheKey, mockData, this.CACHE_TTL);

    return of(mockData);

    // Real implementation (when API is ready):
    // return this.http.get<ApiResponse<RatingDistribution>>(
    //   `${this.apiUrl}/dashboard/rating-distribution`
    // ).pipe(
    //   map(response => response.data),
    //   tap(data => this.cacheService.set(cacheKey, data, this.CACHE_TTL)),
    //   catchError(error => {
    //     this.toastService.showError('Failed to load rating distribution');
    //     return throwError(() => error);
    //   })
    // );
  }

  /**
   * Get recent activity
   * Parameters: pagination params
   * Returns: Paginated list of recent activities
   */
  getRecentActivity(pagination?: PaginationParams): Observable<PaginatedResponse<RecentActivity>> {
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 10;
    const cacheKey = `dashboard:recent:${page}:${pageSize}`;

    // Try cache first
    const cached = this.cacheService.get<PaginatedResponse<RecentActivity>>(cacheKey);
    if (cached) {
      return of(cached);
    }

    // Using mock data for now
    const mockData = this.getMockRecentActivity(page, pageSize);
    this.cacheService.set(cacheKey, mockData, this.CACHE_TTL);

    return of(mockData);
  }

  /**
   * Clear all dashboard cache
   */
  clearCache(): void {
    this.cacheService.invalidate('dashboard:');
  }

  // ==================== MOCK DATA GENERATORS ====================

  /**
   * Mock dashboard metrics
   */
  private getMockMetrics(): DashboardMetrics {
    return {
      totalUsers: 1234,
      totalRestaurants: 456,
      totalPosts: 789,
      averageRating: 4.2,
      trends: {
        users: {
          current: 1234,
          previous: 1102,
          change: 12.0,
          period: 'monthly',
        },
        restaurants: {
          current: 456,
          previous: 422,
          change: 8.0,
          period: 'monthly',
        },
        posts: {
          current: 789,
          previous: 641,
          change: 23.0,
          period: 'monthly',
        },
        ratings: {
          current: 4.2,
          previous: 3.9,
          change: 7.7,
          period: 'monthly',
        },
      },
    };
  }

  /**
   * Mock activity timeline
   */
  private getMockActivityTimeline(
    page: number,
    pageSize: number
  ): PaginatedResponse<ActivityTimeline> {
    const activities: ActivityTimeline[] = [
      {
        id: '1',
        type: 'user_registered',
        description: 'New user registered',
        actor: {
          id: 'u1',
          name: 'María García',
          email: 'maria@example.com',
          avatar: 'https://i.pravatar.cc/150?u=u1',
          role: 'USER',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
      },
      {
        id: '2',
        type: 'restaurant_created',
        description: 'New restaurant submitted for approval',
        actor: {
          id: 'u2',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          avatar: 'https://i.pravatar.cc/150?u=u2',
          role: 'OWNER',
        },
        target: {
          type: 'restaurant',
          id: 'r1',
          name: 'La Cocina de Ana',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
      },
      {
        id: '3',
        type: 'review_submitted',
        description: 'Posted a 5-star review',
        actor: {
          id: 'u3',
          name: 'Carlos López',
          email: 'carlos@example.com',
          avatar: 'https://i.pravatar.cc/150?u=u3',
          role: 'USER',
        },
        target: {
          type: 'restaurant',
          id: 'r2',
          name: 'El Buen Sabor',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      },
      {
        id: '4',
        type: 'post_created',
        description: 'Shared a new food post',
        actor: {
          id: 'u4',
          name: 'Lucía Fernández',
          email: 'lucia@example.com',
          avatar: 'https://i.pravatar.cc/150?u=u4',
          role: 'USER',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
      },
      {
        id: '5',
        type: 'report_filed',
        description: 'Reported inappropriate content',
        actor: {
          id: 'u5',
          name: 'Roberto Díaz',
          email: 'roberto@example.com',
          avatar: 'https://i.pravatar.cc/150?u=u5',
          role: 'USER',
        },
        target: {
          type: 'post',
          id: 'p1',
          name: 'Post #1234',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      },
      {
        id: '6',
        type: 'moderation_action',
        description: 'Approved pending restaurant',
        actor: {
          id: 'u6',
          name: 'Admin User',
          email: 'admin@foodie.com',
          avatar: 'https://i.pravatar.cc/150?u=u6',
          role: 'ADMIN',
        },
        target: {
          type: 'restaurant',
          id: 'r3',
          name: 'Casa Latina',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      },
      {
        id: '7',
        type: 'settings_updated',
        description: 'Updated account settings',
        actor: {
          id: 'u7',
          name: 'Ana Martínez',
          email: 'ana@example.com',
          avatar: 'https://i.pravatar.cc/150?u=u7',
          role: 'USER',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
      },
      {
        id: '8',
        type: 'system_alert',
        description: 'System maintenance scheduled',
        actor: {
          id: 'system',
          name: 'System',
          role: 'SYSTEM',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
      },
    ];

    const total = 150;
    const totalPages = Math.ceil(total / pageSize);

    return {
      items: activities,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Mock rating distribution
   */
  private getMockRatingDistribution(): RatingDistribution {
    return {
      distribution: [
        { stars: 5, count: 450, percentage: 45.0 },
        { stars: 4, count: 300, percentage: 30.0 },
        { stars: 3, count: 150, percentage: 15.0 },
        { stars: 2, count: 70, percentage: 7.0 },
        { stars: 1, count: 30, percentage: 3.0 },
      ],
      totalRatings: 1000,
      averageRating: 4.07,
    };
  }

  /**
   * Mock recent activity
   */
  private getMockRecentActivity(
    page: number,
    pageSize: number
  ): PaginatedResponse<RecentActivity> {
    const activities: RecentActivity[] = [
      {
        id: '1',
        type: 'user_registered',
        description: 'María García registered a new account',
        actor: {
          id: 'u1',
          name: 'María García',
          avatar: 'https://i.pravatar.cc/150?u=u1',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        status: 'completed',
      },
      {
        id: '2',
        type: 'restaurant_created',
        description: 'Juan Pérez submitted "La Cocina de Ana"',
        actor: {
          id: 'u2',
          name: 'Juan Pérez',
          avatar: 'https://i.pravatar.cc/150?u=u2',
        },
        target: {
          type: 'restaurant',
          id: 'r1',
          name: 'La Cocina de Ana',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'pending',
      },
      {
        id: '3',
        type: 'review_submitted',
        description: '5-star review for "El Buen Sabor"',
        actor: {
          id: 'u3',
          name: 'Carlos López',
          avatar: 'https://i.pravatar.cc/150?u=u3',
        },
        target: {
          type: 'restaurant',
          id: 'r2',
          name: 'El Buen Sabor',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'completed',
      },
      {
        id: '4',
        type: 'post_created',
        description: 'Lucía Fernández shared a food post',
        actor: {
          id: 'u4',
          name: 'Lucía Fernández',
          avatar: 'https://i.pravatar.cc/150?u=u4',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        status: 'completed',
      },
      {
        id: '5',
        type: 'report_filed',
        description: 'Inappropriate content reported',
        actor: {
          id: 'u5',
          name: 'Roberto Díaz',
          avatar: 'https://i.pravatar.cc/150?u=u5',
        },
        target: {
          type: 'post',
          id: 'p1',
          name: 'Post #1234',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        status: 'pending',
      },
      {
        id: '6',
        type: 'moderation_action',
        description: 'Approved "Casa Latina" restaurant',
        actor: {
          id: 'u6',
          name: 'Admin User',
          avatar: 'https://i.pravatar.cc/150?u=u6',
        },
        target: {
          type: 'restaurant',
          id: 'r3',
          name: 'Casa Latina',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        status: 'completed',
      },
      {
        id: '7',
        type: 'settings_updated',
        description: 'Ana Martínez updated settings',
        actor: {
          id: 'u7',
          name: 'Ana Martínez',
          avatar: 'https://i.pravatar.cc/150?u=u7',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        status: 'completed',
      },
      {
        id: '8',
        type: 'system_alert',
        description: 'System maintenance scheduled',
        actor: {
          id: 'system',
          name: 'System',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        status: 'completed',
      },
      {
        id: '9',
        type: 'user_registered',
        description: 'Pedro González registered a new account',
        actor: {
          id: 'u8',
          name: 'Pedro González',
          avatar: 'https://i.pravatar.cc/150?u=u8',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        status: 'completed',
      },
      {
        id: '10',
        type: 'review_submitted',
        description: '4-star review for "Pizza Palace"',
        actor: {
          id: 'u9',
          name: 'Laura Sánchez',
          avatar: 'https://i.pravatar.cc/150?u=u9',
        },
        target: {
          type: 'restaurant',
          id: 'r4',
          name: 'Pizza Palace',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        status: 'completed',
      },
    ];

    const total = 100;
    const totalPages = Math.ceil(total / pageSize);

    return {
      items: activities,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }
}
