/**
 * UsersTableComponent - Table displaying users list
 *
 * Features:
 * - Checkbox column for selection
 * - Columns: Avatar, Name, Email, Role, Status, Created Date, Actions
 * - Avatar shows user image or initials
 * - Role badge with color (USER: gray, ADMIN: blue, SUPER_ADMIN: yellow)
 * - Status badge with color (ACTIVE: green, INACTIVE: gray, SUSPENDED: red)
 * - Sortable columns
 * - Row click to view detail
 * - Actions menu (view, edit role, deactivate, delete)
 * - Row hover effect
 * - Loading skeleton
 * - Empty state illustration
 * - Responsive (hide less important columns on mobile)
 */

import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { EmptyStateComponent } from '../../../../shared/components/empty-state';
import { UserRowComponent } from './user-row/user-row.component';

import type { UserListItem } from '../../../../models/users.types';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
    EmptyStateComponent,
    UserRowComponent,
  ],
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.css'],
})
export class UsersTableComponent {
  /**
   * Users to display
   */
  readonly users = input.required<UserListItem[]>();

  /**
   * Selected user IDs
   */
  readonly selectedIds = input.required<Set<string>>();

  /**
   * Whether data is loading
   */
  readonly loading = input(false);

  /**
   * Displayed columns
   */
  readonly displayedColumns = computed(() => {
    return ['select', 'user', 'role', 'status', 'created', 'lastLogin', 'actions'];
  });

  /**
   * Output when selection changes
   */
  readonly selectionChange = output<Set<string>>();

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
   * Output when sort changes
   */
  readonly sortChange = output<{ sortBy: string; sortOrder: 'asc' | 'desc' }>();

  /**
   * Track users by ID
   */
  trackUser(_index: number, user: UserListItem): string {
    return user.id;
  }

  /**
   * Check if user is selected
   */
  isSelected(user: UserListItem): boolean {
    return this.selectedIds().has(user.id);
  }

  /**
   * Toggle user selection
   */
  toggleSelection(userId: string): void {
    const selected = new Set(this.selectedIds());
    if (selected.has(userId)) {
      selected.delete(userId);
    } else {
      selected.add(userId);
    }
    this.selectionChange.emit(selected);
  }

  /**
   * Toggle all selection
   */
  toggleAll(event: Event | any): void {
    const checked = event.checked || (event.target as HTMLInputElement)?.checked;
    const selected = checked
      ? new Set(this.users().map((u) => u.id))
      : new Set<string>();
    this.selectionChange.emit(selected);
  }

  /**
   * Check if all users are selected
   */
  isAllSelected(): boolean {
    return this.users().length > 0 && this.selectedIds().size === this.users().length;
  }

  /**
   * Check if some users are selected
   */
  isSomeSelected(): boolean {
    const selected = this.selectedIds();
    return selected.size > 0 && selected.size < this.users().length;
  }

  /**
   * Handle sort change
   */
  onSort(column: string): void {
    // Toggle sort order if clicking same column
    // Default to descending for new column
    this.sortChange.emit({
      sortBy: column,
      sortOrder: 'desc',
    });
  }
}
