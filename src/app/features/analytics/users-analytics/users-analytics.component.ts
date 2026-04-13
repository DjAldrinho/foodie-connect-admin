/**
 * Users Analytics Component
 * Displays user-related analytics and metrics
 */

import { Component, inject, signal, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AnalyticsService } from '../services/analytics.service';

import type { UsersAnalytics, DateRange } from '../../../models/analytics.types';

/**
 * Users Analytics Component
 *
 * Displays user metrics including:
 * - Total, active, and inactive users
 * - Signup trends over time
 * - Retention rate
 * - Active vs inactive comparison
 */
@Component({
  selector: 'app-users-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users-analytics.component.html',
  styleUrls: ['./users-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersAnalyticsComponent {
  private readonly analyticsService = inject(AnalyticsService);

  // Input
  readonly dateRange = input.required<DateRange>();

  // Signals
  readonly analytics = signal<UsersAnalytics | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Load analytics data
   */
  private loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    const query = {
      dateRange: this.dateRange(),
    };

    this.analyticsService.getUsersAnalytics(query).subscribe({
      next: (data: UsersAnalytics) => {
        this.analytics.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Calculate inactive percentage
   */
  getInactivePercentage(): number {
    const data = this.analytics();
    if (!data) return 0;

    return (data.inactiveUsers / data.totalUsers) * 100;
  }

  /**
   * Calculate active percentage
   */
  getActivePercentage(): number {
    const data = this.analytics();
    if (!data) return 0;

    return (data.activeUsers / data.totalUsers) * 100;
  }
}
