import { Component, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule } from '@angular/common';

/**
 * NotificationBellComponent - Notification bell icon in top bar
 *
 * Features:
 * - Bell icon with badge count
 * - Badge shows unread count
 * - Click opens notifications panel
 * - Animations for new notifications
 * - Red/green badge color based on priority
 * - Keyboard accessible
 * - ARIA live region for announcements
 *
 * @example
 * ```html
 * <app-notification-bell></app-notification-bell>
 * ```
 */
@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatBadgeModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css'],
})
export class NotificationBellComponent {
  /**
   * Number of unread notifications
   * In a real app, this would come from a notification service
   */
  readonly unreadCount = signal(3);

  /**
   * Whether notification panel is open
   */
  readonly isPanelOpen = signal(false);

  /**
   * Badge content (shows count or nothing if zero)
   */
  readonly badgeContent = computed(() =>
    this.unreadCount() > 0 ? this.unreadCount() : null
  );

  /**
   * Badge color based on priority/count
   */
  readonly badgeColor = computed(() =>
    this.unreadCount() > 10 ? 'warn' : 'accent'
  );

  /**
   * ARIA live announcement text
   */
  readonly announcementText = computed(() => {
    const count = this.unreadCount();
    if (count === 0) return 'No tienes notificaciones nuevas';
    if (count === 1) return 'Tienes 1 notificación nueva';
    return `Tienes ${count} notificaciones nuevas`;
  });

  /**
   * Toggle notification panel
   */
  togglePanel(): void {
    this.isPanelOpen.update((open) => !open);
  }

  /**
   * Close notification panel
   */
  closePanel(): void {
    this.isPanelOpen.set(false);
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    // In a real app, this would call a notification service
    this.unreadCount.set(0);
  }
}
