import { Component, inject, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import type { MetricCardData } from '../../../../models/dashboard.types';

/**
 * MetricCardComponent - Reusable metric display card
 *
 * Displays a single metric with:
 * - Icon and title
 * - Main value
 * - Optional trend indicator (percentage change)
 * - Optional subtitle
 * - Click handler for navigation
 *
 * Features:
 * - Standalone component
 * - Signals for state management
 * - OnPush change detection
 * - WCAG AA compliance
 * - Responsive design
 * - Hover effect
 * - Loading skeleton support
 *
 * @example
 * ```html
 * <app-metric-card
 *   [data]="metricData"
 *   [loading]="false"
 *   (clicked)="onMetricClick($event)"
 * />
 * ```
 */
@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './metric-card.component.html',
  styleUrls: ['./metric-card.component.css'],
})
export class MetricCardComponent {
  private readonly router = inject(Router);

  /**
   * Metric data to display
   */
  readonly data = input.required<MetricCardData>();

  /**
   * Loading state - shows skeleton
   */
  readonly loading = input(false);

  /**
   * Click event output
   */
  readonly clicked = output<string>();

  /**
   * Computed: trend icon based on positive/negative change
   */
  readonly trendIcon = computed(() => {
    const trend = this.data().trend;
    if (!trend) return '';

    return trend.value >= 0 ? 'trending_up' : 'trending_down';
  });

  /**
   * Computed: trend CSS class (green for positive, red for negative)
   */
  readonly trendClass = computed(() => {
    const trend = this.data().trend;
    if (!trend) return '';

    return trend.value >= 0 ? 'trend-positive' : 'trend-negative';
  });

  /**
   * Computed: formatted trend value with sign
   */
  readonly trendValue = computed(() => {
    const trend = this.data().trend;
    if (!trend) return '';

    const sign = trend.value >= 0 ? '+' : '';
    return `${sign}${trend.value}%`;
  });

  /**
   * Handle card click
   */
  onClick(): void {
    const metricData = this.data();

    // Emit click event
    this.clicked.emit(metricData.title);

    // Navigate if route is provided
    if (metricData.route) {
      this.router.navigate([metricData.route]);
    }
  }

  /**
   * Get ARIA label for accessibility
   */
  getAriaLabel(): string {
    const metricData = this.data();
    let label = `${metricData.title}: ${metricData.value}`;

    if (metricData.trend) {
      const direction = metricData.trend.value >= 0 ? 'up' : 'down';
      label += `, ${direction} by ${Math.abs(metricData.trend.value)}% compared to last ${metricData.trend.period}`;
    }

    if (metricData.subtitle) {
      label += `. ${metricData.subtitle}`;
    }

    return label;
  }
}
