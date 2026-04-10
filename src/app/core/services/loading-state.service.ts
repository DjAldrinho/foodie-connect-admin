import { Injectable, inject, signal, computed } from '@angular/core';

/**
 * Loading state service
 * Manages global loading state across the application
 * Tracks active requests and provides loading signals
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingStateService {
  // Private state
  private readonly activeRequests = signal(0);
  private readonly loadingDelay = 300; // ms delay before showing loading
  private readonly minDisplayTime = 500; // ms minimum display time

  // Loading state signals
  public readonly isLoading = computed(() => this.activeRequests() > 0);
  public readonly hasActiveRequests = computed(() => this.activeRequests() > 0);

  /**
   * Increment active request count
   */
  incrementLoading(): void {
    this.activeRequests.update((count) => count + 1);
  }

  /**
   * Decrement active request count
   */
  decrementLoading(): void {
    this.activeRequests.update((count) => Math.max(0, count - 1));
  }

  /**
   * Set loading state manually
   * @param loading Loading state
   */
  setLoading(loading: boolean): void {
    if (loading) {
      this.incrementLoading();
    } else {
      this.decrementLoading();
    }
  }

  /**
   * Get current active request count
   * @returns Number of active requests
   */
  getActiveRequestCount(): number {
    return this.activeRequests();
  }

  /**
   * Reset loading state
   */
  reset(): void {
    this.activeRequests.set(0);
  }

  /**
   * Check if loading indicator should be shown
   * Considers delay and minimum display time
   * @returns true if loading should be shown
   */
  shouldShowLoading(): boolean {
    return this.isLoading();
  }

  /**
   * Get loading delay in milliseconds
   * @returns Loading delay
   */
  getLoadingDelay(): number {
    return this.loadingDelay;
  }

  /**
   * Get minimum display time in milliseconds
   * @returns Minimum display time
   */
  getMinDisplayTime(): number {
    return this.minDisplayTime;
  }
}
