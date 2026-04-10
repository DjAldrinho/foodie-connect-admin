/**
 * BulkActionsComponent - Bulk action bar for selected users
 *
 * Features:
 * - Shows count of selected users
 * - Action buttons: Delete, Change Role, Change Status
 * - Deselect all button
 * - Slide-in animation
 * - Sticky positioning
 */

import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

import type { UserRole, UserStatus } from '../../../../models/auth.types';

@Component({
  selector: 'app-bulk-actions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
  ],
  templateUrl: './bulk-actions.component.html',
  styleUrls: ['./bulk-actions.component.css'],
})
export class BulkActionsComponent {
  /**
   * Number of selected users
   */
  readonly selectedCount = input.required<number>();

  /**
   * Output when deselect all is clicked
   */
  readonly deselectAll = output<void>();

  /**
   * Output when delete action is triggered
   */
  readonly delete = output<void>();

  /**
   * Output when change role action is triggered
   */
  readonly changeRole = output<UserRole>();

  /**
   * Output when change status action is triggered
   */
  readonly changeStatus = output<UserStatus>();

  /**
   * Role options
   */
  readonly roleOptions: Array<{ value: UserRole; label: string }> = [
    { value: 'USER' as UserRole, label: 'User' },
    { value: 'ADMIN' as UserRole, label: 'Admin' },
    { value: 'SUPER_ADMIN' as UserRole, label: 'Super Admin' },
  ];

  /**
   * Status options
   */
  readonly statusOptions: Array<{ value: UserStatus; label: string }> = [
    { value: 'ACTIVE' as UserStatus, label: 'Active' },
    { value: 'INACTIVE' as UserStatus, label: 'Inactive' },
    { value: 'SUSPENDED' as UserStatus, label: 'Suspended' },
  ];

  /**
   * Handle delete click
   */
  onDelete(): void {
    this.delete.emit();
  }

  /**
   * Handle change role click
   */
  onChangeRole(role: UserRole): void {
    this.changeRole.emit(role);
  }

  /**
   * Handle change status click
   */
  onChangeStatus(status: UserStatus): void {
    this.changeStatus.emit(status);
  }
}
