import { Component, inject, signal, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../services/analytics.service';
import type { ContentAnalytics, DateRange } from '../../../models/analytics.types';

@Component({
  selector: 'app-content-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-analytics.component.html',
  styleUrls: ['./content-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentAnalyticsComponent {
  private readonly analyticsService = inject(AnalyticsService);
  readonly dateRange = input.required<DateRange>();
  readonly analytics = signal<ContentAnalytics | null>(null);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.analyticsService.getContentAnalytics({ dateRange: this.dateRange() }).subscribe({
      next: (data: ContentAnalytics) => {
        this.analytics.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
