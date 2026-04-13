/**
 * Analytics Page Component
 * Main component for analytics with tab navigation
 */

import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AnalyticsService } from '../services/analytics.service';
import { UsersAnalyticsComponent } from '../users-analytics/users-analytics.component';
import { ContentAnalyticsComponent } from '../content-analytics/content-analytics.component';
import { RestaurantAnalyticsComponent } from '../restaurant-analytics/restaurant-analytics.component';
import { SearchAnalyticsComponent } from '../search-analytics/search-analytics.component';

import type { AnalyticsQuery, DateRange } from '../../../models/analytics.types';

/**
 * Analytics Page Component
 *
 * Main analytics page with tab navigation for different analytics views.
 * Includes date range picker and export functionality.
 */
@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UsersAnalyticsComponent, ContentAnalyticsComponent, RestaurantAnalyticsComponent, SearchAnalyticsComponent],
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPageComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);

  // Signals
  readonly activeTab = signal<'users' | 'content' | 'restaurants' | 'search'>('users');
  readonly dateRange = signal<DateRange>('30d');
  readonly isLoading = signal(false);

  // Date range options
  readonly dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
    { value: 'all', label: 'All time' },
  ];

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.loadAnalytics();
  }

  /**
   * Load analytics data
   */
  private loadAnalytics(): void {
    this.isLoading.set(true);

    const query: AnalyticsQuery = {
      dateRange: this.dateRange(),
    };

    // Load data based on active tab
    // This is handled by child components
    this.isLoading.set(false);
  }

  /**
   * Change active tab
   */
  changeTab(tab: 'users' | 'content' | 'restaurants' | 'search'): void {
    this.activeTab.set(tab);
    this.loadAnalytics();
  }

  /**
   * Change date range
   */
  changeDateRange(dateRange: DateRange): void {
    this.dateRange.set(dateRange);
    this.loadAnalytics();
  }

  /**
   * Export data
   */
  exportData(format: 'csv' | 'json'): void {
    this.analyticsService
      .exportData({
        type: this.activeTab(),
        format,
        dateRange: this.dateRange(),
      })
      .subscribe({
        next: (blob: Blob) => {
          // Download file
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `analytics-${this.activeTab()}-${Date.now()}.${format}`;
          a.click();
          URL.revokeObjectURL(url);
        },
        error: () => {
          console.error('Failed to export data');
        },
      });
  }
}
