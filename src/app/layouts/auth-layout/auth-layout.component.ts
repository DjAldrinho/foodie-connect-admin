import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterOutlet } from '@angular/router';

/**
 * AuthLayoutComponent - Layout wrapper for authentication pages
 *
 * Provides a centered card layout with gradient background for:
 * - Login page
 * - Forgot password page
 * - Registration page (future)
 *
 * Features:
 * - Responsive design (full width on mobile, centered card on desktop)
 * - Brand gradient background
 * - Logo/header section
 * - Footer with copyright
 * - Outlet for child content
 *
 * @example
 * ```html
 * <ng-component>
 *   <!-- Auth pages rendered here -->
 * </ng-component>
 * ```
 */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, NgOptimizedImage],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {
  readonly currentYear = new Date().getFullYear();
}
