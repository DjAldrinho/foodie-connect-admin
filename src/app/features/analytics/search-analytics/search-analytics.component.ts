import { Component, inject, signal, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../services/analytics.service';
import type { SearchAnalytics, DateRange } from '../../../models/analytics.types';

@Component({
  selector: 'app-search-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-analytics.component.html',
  styleUrls: ['./search-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchAnalyticsComponent {
  private readonly analyticsService = inject(AnalyticsService);
  readonly dateRange = input.required<DateRange>();
  readonly analytics = signal<SearchAnalytics | null>(null);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.analyticsService.getSearchAnalytics({ dateRange: this.dateRange() }).subscribe({
      next: (data: SearchAnalytics) => {
        this.analytics.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
