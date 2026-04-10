import { Component, output, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationBellComponent } from './notification-bell/notification-bell.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';

/**
 * TopBarComponent - Top navigation bar
 *
 * Features:
 * - Mobile menu toggle button
 * - Breadcrumb navigation
 * - Notification bell with badge
 * - Responsive design (hides on mobile when sidebar is open)
 * - Fixed height (64px)
 * - Shadow for separation from content
 *
 * @example
 * ```html
 * <app-top-bar (menuToggle)="toggleSidebar()"></app-top-bar>
 * ```
 */
@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    NotificationBellComponent,
    BreadcrumbsComponent,
  ],
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
})
export class TopBarComponent {
  /**
   * Event emitted when mobile menu toggle is clicked
   */
  readonly menuToggle = output<void>();
}
