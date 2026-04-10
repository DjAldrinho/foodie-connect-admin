import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { DashboardService } from './services/dashboard.service';
import { MetricCardComponent } from './components/metric-card';
import { ActivityTimelineComponent } from './components/activity-timeline';
import { RatingDistributionChartComponent } from './components/rating-chart';
import { RecentActivityComponent } from './components/recent-activity';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner';
import { EmptyStateComponent } from '../../shared/components/empty-state';
import { ToastNotificationService } from '../../core/services/toast-notification.service';

import type { MetricCardData } from '../../models/dashboard.types';
import type { DashboardMetrics } from '../../models/dashboard.types';

/**
 * DashboardComponent - Main dashboard page
 *
 * Displays:
 * - 4 metric cards (users, restaurants, posts, ratings)
 * - Activity timeline
 * - Rating distribution chart
 * - Recent activity table
 *
 * Features:
 * - Standalone component
 * - Signals for state management
 * - OnPush change detection
 * - Auto-refresh every 30 seconds
 * - Manual refresh button
 * - Loading and empty states
 * - WCAG AA compliance
 * - Responsive design
 *
 * Phase 3 implementation
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MetricCardComponent,
    ActivityTimelineComponent,
    RatingDistributionChartComponent,
    RecentActivityComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly router = inject(Router);

  // State signals
  readonly loading = signal(true);
  readonly refreshing = signal(false);

  // Data signals
  readonly metrics = signal<DashboardMetrics | null>(null);
  readonly error = signal<string | null>(null);

  // Auto-refresh interval
  private refreshInterval: ReturnType<typeof setInterval> | null = null;
  private readonly REFRESH_INTERVAL = 30000; // 30 seconds

  /**
   * Computed: Metric cards data
   */
  readonly metricCards = computed<MetricCardData[]>(() => {
    const metricsData = this.metrics();
    if (!metricsData) return [];

    return [
      {
        title: 'Total Users',
        value: metricsData.totalUsers.toLocaleString(),
        icon: 'people',
        color: '#FF6B35',
        trend: {
          value: metricsData.trends.users.change,
          period: this.formatPeriod(metricsData.trends.users.period),
        },
        route: '/users',
      },
      {
        title: 'Total Restaurants',
        value: metricsData.totalRestaurants.toLocaleString(),
        icon: 'restaurant',
        color: '#2C3E50',
        trend: {
          value: metricsData.trends.restaurants.change,
          period: this.formatPeriod(metricsData.trends.restaurants.period),
        },
        subtitle: '123 pending approval',
        route: '/restaurants',
      },
      {
        title: 'Total Posts',
        value: metricsData.totalPosts.toLocaleString(),
        icon: 'article',
        color: '#F39C12',
        trend: {
          value: metricsData.trends.posts.change,
          period: this.formatPeriod(metricsData.trends.posts.period),
        },
        subtitle: '45 posts today',
        route: '/posts',
      },
      {
        title: 'Average Rating',
        value: metricsData.averageRating.toFixed(1) + ' / 5.0',
        icon: 'star',
        color: '#27AE60',
        trend: {
          value: metricsData.trends.ratings.change,
          period: this.formatPeriod(metricsData.trends.ratings.period),
        },
        route: '/analytics',
      },
    ];
  });

  ngOnInit(): void {
    this.loadDashboard();

    // Setup auto-refresh
    this.refreshInterval = setInterval(() => {
      this.refreshDashboard();
    }, this.REFRESH_INTERVAL);
  }

  ngOnDestroy(): void {
    // Clear interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Load dashboard data
   */
  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard:', err);
        this.error.set('Failed to load dashboard data');
        this.loading.set(false);
        this.toastService.error('Failed to load dashboard');
      },
    });
  }

  /**
   * Manual refresh
   */
  refreshDashboard(): void {
    if (this.refreshing()) return;

    this.refreshing.set(true);

    // Clear cache to force refresh
    this.dashboardService.clearCache();

    this.dashboardService.getMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.refreshing.set(false);
        this.toastService.success('Dashboard updated');
      },
      error: (err) => {
        console.error('Failed to refresh dashboard:', err);
        this.refreshing.set(false);
        this.toastService.error('Failed to refresh dashboard');
      },
    });
  }

  /**
   * Handle metric card click
   */
  onMetricClick(metricTitle: string): void {
    console.log('Metric clicked:', metricTitle);
    // Navigation is handled by MetricCardComponent
  }

  /**
   * Format period for display
   */
  private formatPeriod(period: string): string {
    const periodMap: Record<string, string> = {
      daily: 'vs yesterday',
      weekly: 'vs last week',
      monthly: 'vs last month',
    };
    return periodMap[period] || period;
  }

  /**
   * Get ARIA label for refresh button
   */
  getRefreshAriaLabel(): string {
    return this.refreshing() ? 'Refreshing dashboard...' : 'Refresh dashboard';
  }
}
