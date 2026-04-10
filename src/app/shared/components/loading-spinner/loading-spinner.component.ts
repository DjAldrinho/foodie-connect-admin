import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingStateService } from '../../../core/services/loading-state.service';

/**
 * LoadingSpinnerComponent - Global loading spinner component
 *
 * Features:
 * - Circular progress indicator
 * - Overlay with semi-transparent backdrop
 * - Centered on screen
 * - Shows/hides based on LoadingStateService
 * - ARIA busy attribute when visible
 * - ARIA live region for announcements
 *
 * @example
 * ```html
 * <app-loading-spinner></app-loading-spinner>
 * ```
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css'],
})
export class LoadingSpinnerComponent {
  private readonly loadingService = inject(LoadingStateService);

  /**
   * Whether loading is active
   */
  readonly isLoading = this.loadingService.isLoading;

  /**
   * ARIA busy attribute
   */
  readonly ariaBusy = computed(() => (this.isLoading() ? 'true' : 'false'));
}
