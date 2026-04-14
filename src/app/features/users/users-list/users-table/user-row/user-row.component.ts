/**
 * UserRowComponent - Individual row in users table
 *
 * Features:
 * - Checkbox for selection
 * - Displays user cells
 * - Role badge with color
 * - Status badge with color
 * - Actions menu (kebab button)
 * - Hover effect
 * - Keyboard navigation (arrow keys, Space, Enter)
 * - ARIA row role
 */

import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import type { UserListItem } from '../../../../../models/users.types';
import type { UserRole, UserStatus } from '../../../../../models/auth.types';

@Component({
  selector: 'div[app-user-row]',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './user-row.component.html',
  styleUrls: ['./user-row.component.css'],
  host: {
    '[class.selected]': 'selected()',
    '[attr.role]': '"row"',
    '[tabindex]': '0',
    '(keydown)': 'onKeyDown($event)',
    '(click)': 'onRowClick()',
  },
})
export class UserRowComponent {
  /**
   * User data
   */
  readonly user = input.required<UserListItem>();

  /**
   * Whether row is selected
   */
  readonly selected = input(false);

  /**
   * Output when checkbox is toggled
   */
  readonly selectionToggle = output<void>();

  /**
   * Output when view action is triggered
   */
  readonly view = output<string>();

  /**
   * Output when edit role action is triggered
   */
  readonly editRole = output<string>();

  /**
   * Output when deactivate action is triggered
   */
  readonly deactivate = output<string>();

  /**
   * Output when delete action is triggered
   */
  readonly delete = output<string>();

  /**
   * Get role badge color class
   */
  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'badge-super-admin';
      case 'ADMIN':
        return 'badge-admin';
      case 'USER':
        return 'badge-user';
      default:
        return 'badge-user';
    }
  }

  /**
   * Get status badge color class
   */
  getStatusBadgeClass(status: UserStatus): string {
    switch (status) {
      case 'ACTIVE':
        return 'badge-active';
      case 'INACTIVE':
        return 'badge-inactive';
      case 'SUSPENDED':
        return 'badge-suspended';
      default:
        return 'badge-inactive';
    }
  }

  /**
   * Handle checkbox change
   */
  onCheckboxChange(event: Event | any): void {
    event.stopPropagation();
    this.selectionToggle.emit();
  }

  /**
   * Handle row click
   */
  onRowClick(): void {
    // Navigate to user detail
    this.view.emit(this.user().id);
  }

  /**
   * Handle keyboard navigation
   */
  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.onRowClick();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        // Let parent handle navigation
        break;
    }
  }

  /**
   * Get user initials
   */
  getInitials(firstName: string, lastName: string): string {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Format last login
   */
  formatLastLogin(dateString?: string): string {
    if (!dateString) return 'Never';
    return this.formatDate(dateString);
  }
}
