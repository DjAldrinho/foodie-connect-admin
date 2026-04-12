import { Component, inject, OnInit, OnDestroy, signal, viewChild, ElementRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { DashboardService } from '../../services/dashboard.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner';

import type { RatingDistribution } from '../../../../models/dashboard.types';

import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

/**
 * RatingDistributionChartComponent - Bar chart showing rating distribution
 *
 * Displays rating distribution (1-5 stars) as a bar chart with:
 * - X-axis: Star ratings (1-5)
 * - Y-axis: Number of reviews
 * - Brand colors (#FF6B35)
 * - Responsive design
 * - Tooltips with details
 *
 * Features:
 * - Standalone component
 * - OnPush change detection
 * - Chart.js integration
 * - Loading skeleton
 * - Empty state
 * - WCAG AA compliance
 * - Responsive (legend moves to bottom on mobile)
 *
 * @example
 * ```html
 * <app-rating-chart />
 * ```
 */
@Component({
  selector: 'app-rating-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    EmptyStateComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './rating-chart.component.html',
  styleUrls: ['./rating-chart.component.css'],
})
export class RatingDistributionChartComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);

  // Canvas reference
  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  // State signals
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly distribution = signal<RatingDistribution | null>(null);

  // Signal to store pending data for rendering
  private pendingData = signal<RatingDistribution | null>(null);

  // Chart instance
  private chart: Chart | null = null;

  constructor() {
    // Render chart after DOM is ready if there's pending data
    afterNextRender(() => {
      const data = this.pendingData();
      if (data) {
        this.renderChart(data);
        this.pendingData.set(null);
      }
    });
  }

  ngOnInit(): void {
    this.loadRatingDistribution();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  /**
   * Load rating distribution
   */
  loadRatingDistribution(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getRatingDistribution().subscribe({
      next: (data) => {
        this.distribution.set(data);

        // Check if canvas is available
        const canvasElement = this.canvasRef();
        if (canvasElement) {
          // Canvas is ready, render immediately
          this.renderChart(data);
        } else {
          // Canvas not ready, store data for afterNextRender
          this.pendingData.set(data);
        }

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load rating distribution:', err);
        this.error.set('Failed to load rating distribution');
        this.loading.set(false);
      },
    });
  }

  /**
   * Render chart using Chart.js
   */
  private renderChart(data: RatingDistribution): void {
    // Get canvas element (should be available when this is called)
    const canvasElement = this.canvasRef();
    if (!canvasElement) {
      console.error('Canvas element not available when trying to render');
      return;
    }

    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    const canvas = canvasElement.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    // Extract labels and values from distribution
    const labels = data.distribution.map((d) => `${d.stars} Stars`);
    const values = data.distribution.map((d) => d.count);

    // Brand color palette (gradient from red to green)
    const colors = data.distribution.map((d) => {
      const colorMap: Record<number, string> = {
        1: '#ef4444', // red
        2: '#f97316', // orange
        3: '#eab308', // yellow
        4: '#84cc16', // lime
        5: '#22c55e', // green
      };
      return colorMap[d.stars];
    });

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Number of Reviews',
            data: values,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14,
              weight: 600,
            },
            bodyFont: {
              size: 13,
            },
            padding: 12,
            cornerRadius: 6,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const index = context.dataIndex;
                const segment = data.distribution[index];
                return [
                  `${segment.count} reviews`,
                  `${segment.percentage}% of total`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 12,
              },
              color: '#6b7280',
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#e5e7eb',
            },
            ticks: {
              font: {
                size: 12,
              },
              color: '#6b7280',
              precision: 0,
            },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  /**
   * Get total ratings count
   */
  getTotalRatings(): string {
    const data = this.distribution();
    return data ? data.totalRatings.toLocaleString() : '0';
  }

  /**
   * Get average rating
   */
  getAverageRating(): string {
    const data = this.distribution();
    return data ? data.averageRating.toFixed(1) : '0.0';
  }
}
