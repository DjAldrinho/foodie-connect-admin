import { Injectable, inject, signal, computed } from '@angular/core';

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast notification interface
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: ToastAction;
  timestamp: number;
}

/**
 * Toast action button interface
 */
export interface ToastAction {
  label: string;
  handler: () => void;
}

/**
 * Toast notification configuration
 */
const TOAST_CONFIG = {
  maxVisible: 3,
  defaultDuration: 5000, // 5 seconds
  dismissDuration: 300, // Animation duration
} as const;

/**
 * Toast notification service
 * Manages toast notifications with auto-dismiss and stack management
 */
@Injectable({
  providedIn: 'root',
})
export class ToastNotificationService {
  // Private state
  private readonly toastsSignal = signal<Toast[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  // Public signals
  public readonly toasts = this.toastsSignal.asReadonly();
  public readonly visibleToasts = computed(() =>
    this.toastsSignal().slice(0, TOAST_CONFIG.maxVisible)
  );
  public readonly hasVisibleToasts = computed(() => this.toastsSignal().length > 0);
  public readonly toastCount = computed(() => this.toastsSignal().length);

  /**
   * Show a toast notification
   * @param message Message to display (or translation key)
   * @param type Toast type
   * @param duration Auto-dismiss duration in ms (0 = no auto-dismiss)
   * @param action Optional action button
   * @returns Toast ID for manual dismissal
   */
  show(
    message: string,
    type: ToastType = 'info',
    duration: number = TOAST_CONFIG.defaultDuration,
    action?: ToastAction
  ): string {
    const toastId = this.generateToastId();

    const toast: Toast = {
      id: toastId,
      message,
      type,
      duration,
      action,
      timestamp: Date.now(),
    };

    // Add toast to stack
    this.toastsSignal.update((toasts) => {
      // Remove oldest toasts if max visible exceeded
      const trimmedToasts =
        toasts.length >= TOAST_CONFIG.maxVisible
          ? toasts.slice(toasts.length - TOAST_CONFIG.maxVisible + 1)
          : toasts;
      return [...trimmedToasts, toast];
    });

    // Set auto-dismiss timer
    if (duration > 0) {
      const timer = setTimeout(() => {
        this.dismiss(toastId);
      }, duration);
      this.timers.set(toastId, timer);
    }

    return toastId;
  }

  /**
   * Show success toast
   * @param message Success message
   * @param duration Duration in ms
   */
  success(message: string, duration?: number): string {
    return this.show(message, 'success', duration);
  }

  /**
   * Show error toast
   * @param message Error message
   * @param duration Duration in ms
   */
  error(message: string, duration?: number): string {
    return this.show(message, 'error', duration);
  }

  /**
   * Show info toast
   * @param message Info message
   * @param duration Duration in ms
   */
  info(message: string, duration?: number): string {
    return this.show(message, 'info', duration);
  }

  /**
   * Show warning toast
   * @param message Warning message
   * @param duration Duration in ms
   */
  warning(message: string, duration?: number): string {
    return this.show(message, 'warning', duration);
  }

  /**
   * Dismiss a specific toast
   * @param toastId Toast ID to dismiss
   */
  dismiss(toastId: string): void {
    // Clear timer if exists
    const timer = this.timers.get(toastId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(toastId);
    }

    // Remove toast after animation
    setTimeout(() => {
      this.toastsSignal.update((toasts) => toasts.filter((t) => t.id !== toastId));
    }, TOAST_CONFIG.dismissDuration);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    // Clear all timers
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    // Clear all toasts after animation
    setTimeout(() => {
      this.toastsSignal.set([]);
    }, TOAST_CONFIG.dismissDuration);
  }

  /**
   * Check if toast exists
   * @param toastId Toast ID
   * @returns true if toast exists
   */
  hasToast(toastId: string): boolean {
    return this.toastsSignal().some((t) => t.id === toastId);
  }

  /**
   * Get toast by ID
   * @param toastId Toast ID
   * @returns Toast or undefined
   */
  getToast(toastId: string): Toast | undefined {
    return this.toastsSignal().find((t) => t.id === toastId);
  }

  /**
   * Clear all timers (for cleanup)
   */
  private clearAllTimers(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  /**
   * Generate unique toast ID
   * @returns Unique toast ID
   */
  private generateToastId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    this.clearAllTimers();
  }
}

/**
 * Factory function for ToastNotificationService
 * Required for Angular's inject()-based DI
 */
export const toastNotificationServiceFactory = () => new ToastNotificationService();
