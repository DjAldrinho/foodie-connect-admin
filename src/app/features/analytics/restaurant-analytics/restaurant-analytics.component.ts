import { Component, inject, signal, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../services/analytics.service';
import type { RestaurantAnalytics, DateRange } from '../../../models/analytics.types';

@Component({
  selector: 'app-restaurant-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-analytics.component.html',
  styleUrls: ['./restaurant-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestaurantAnalyticsComponent {
  private readonly analyticsService = inject(AnalyticsService);
  readonly dateRange = input.required<DateRange>();
  readonly analytics = signal<RestaurantAnalytics | null>(null);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.analyticsService.getRestaurantAnalytics({ dateRange: this.dateRange() }).subscribe({
      next: (data: RestaurantAnalytics) => {
        this.analytics.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
