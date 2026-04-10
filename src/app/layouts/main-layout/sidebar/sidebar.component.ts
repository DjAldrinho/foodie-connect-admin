import { Component, inject, output, input, booleanAttribute } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../../core/auth/services/auth.service';

/**
 * Navigation menu item interface
 */
interface NavMenuItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
  external?: boolean;
}

/**
 * SidebarComponent - Main navigation sidebar
 *
 * Features:
 * - 8 module navigation links with icons
 * - Active route highlighting
 * - Collapsible state (desktop)
 * - Slide-in drawer (mobile)
 * - Keyboard navigation (arrow keys, Enter)
 * - User menu at bottom
 * - Close button on mobile
 *
 * @example
 * ```html
 * <app-sidebar [open]="true" [collapsed]="false" (close)="onClose()"></app-sidebar>
 * ```
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, NgOptimizedImage],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly authService = AuthService();

  /**
   * Whether sidebar is open (mobile toggle)
   */
  readonly open = input(false, { transform: booleanAttribute });

  /**
   * Whether sidebar is collapsed (desktop collapsed state)
   */
  readonly collapsed = input(false, { transform: booleanAttribute });

  /**
   * Whether this is mobile mode
   */
  readonly mobile = input(false, { transform: booleanAttribute });

  /**
   * Event emitted when sidebar should close (mobile)
   */
  readonly close = output<void>();

  /**
   * Navigation menu items
   */
  readonly menuItems: NavMenuItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/users', label: 'Usuarios', icon: 'people' },
    { path: '/restaurants', label: 'Restaurantes', icon: 'restaurant' },
    { path: '/moderation', label: 'Moderación', icon: 'moderation' },
    { path: '/notifications', label: 'Notificaciones', icon: 'notifications' },
    { path: '/analytics', label: 'Analíticas', icon: 'analytics' },
    { path: '/settings', label: 'Configuración', icon: 'settings' },
  ];

  /**
   * Current user display name
   */
  readonly userName = 'Admin Usuario';

  /**
   * Current user role
   */
  readonly userRole = 'Super Admin';

  /**
   * Close sidebar (mobile)
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Handle navigation item click
   * Closes sidebar on mobile after navigation
   */
  onNavClick(): void {
    if (this.mobile()) {
      this.onClose();
    }
  }

  /**
   * Handle logout
   */
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Handle keyboard navigation
   */
  onKeydown(event: KeyboardEvent, index: number): void {
    const items = this.menuItems.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusMenuItem(Math.min(index + 1, items - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusMenuItem(Math.max(index - 1, 0));
        break;
      case 'Escape':
        if (this.mobile()) {
          this.onClose();
        }
        break;
    }
  }

  /**
   * Focus a specific menu item by index
   */
  private focusMenuItem(index: number): void {
    const navItems = document.querySelectorAll('.nav-item');
    const item = navItems[index] as HTMLElement;
    item?.focus();
  }
}
