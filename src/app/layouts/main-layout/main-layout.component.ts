import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

/**
 * MainLayoutComponent - Main application layout
 *
 * Provides the primary application structure with:
 * - Collapsible sidebar (left)
 * - Top navigation bar (fixed height)
 * - Main content area (remaining space)
 * - Responsive design (sidebar hidden on mobile)
 *
 * Features:
 * - Automatic sidebar collapse on mobile
 * - Manual sidebar toggle
 * - Proper ARIA roles for accessibility
 * - Smooth transitions
 *
 * @example
 * ```html
 * <app-main-layout>
 *   <!-- Page content rendered here -->
 * </app-main-layout>
 * ```
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopBarComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  /**
   * Whether the device is mobile (sidebar hidden by default)
   */
  readonly isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).pipe(
      map((result) => result.matches)
    ),
    { initialValue: false }
  );

  /**
   * Sidebar visibility state
   * - On mobile: hidden by default, toggled via hamburger menu
   * - On desktop: visible by default, can be collapsed
   */
  sidebarOpen = true;

  /**
   * Toggle sidebar visibility
   * Used by mobile hamburger menu and desktop collapse button
   */
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  /**
   * Close sidebar (mobile only)
   * Called when clicking outside or selecting a menu item on mobile
   */
  closeSidebar(): void {
    if (this.isMobile()) {
      this.sidebarOpen = false;
    }
  }
}
