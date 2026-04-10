import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ToastNotificationService, Toast } from '../../../core/services/toast-notification.service';

/**
 * ToastContainerComponent - Container for displaying toast notifications
 *
 * Features:
 * - Fixed position (top-right)
 * - Displays toasts from ToastNotificationService
 * - Max 3 toasts visible at once
 * - Stack animation (new toasts appear at top)
 * - Dismiss button on each toast
 * - Auto-dismiss after duration
 * - Different colors by type (success, error, warning, info)
 * - ARIA live region for screen readers
 * - ARIA alerts for errors
 *
 * @example
 * ```html
 * <app-toast-container></app-toast-container>
 * ```
 */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.css'],
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastNotificationService);

  /**
   * Computed toasts limited to 3 max
   */
  readonly visibleToasts = computed(() => {
    const allToasts = this.toastService.toasts();
    return allToasts.slice(0, 3);
  });

  /**
   * Dismiss a toast by ID
   */
  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  /**
   * Get icon for toast type
   */
  getIcon(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  /**
   * Track toasts for ngFor performance
   */
  trackToast(index: number, toast: Toast): string {
    return toast.id;
  }
}
