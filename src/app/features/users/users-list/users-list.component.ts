/**
 * UsersListComponent - Main users list page
 *
 * Features:
 * - Grid/list toggle view
 * - User filters (search, role, status, date range)
 * - Pagination
 * - Bulk actions toolbar
 * - Export to CSV button
 * - Add new user button (future)
 * - Loading state
 * - Empty state
 */

import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialogModule } from '@angular/material/dialog';

import { UsersService } from '../services/users.service';
import { ToastNotificationService } from '../../../core/services/toast-notification.service';
import { UserFiltersComponent } from './user-filters/user-filters.component';
import { UsersTableComponent } from './users-table/users-table.component';
import { BulkActionsComponent } from './bulk-actions/bulk-actions.component';

import type { UserListItem, UserListFilters } from '../../../models/users.types';
import type { UserRole, UserStatus } from '../../../models/auth.types';
import { MatDialog } from '@angular/material/dialog';
import {
  ChangeRoleDialogComponent,
  DeactivateUserDialogComponent,
  DeleteUserDialogComponent,
} from '../dialogs/dialogs';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    UserFiltersComponent,
    UsersTableComponent,
    BulkActionsComponent,
  ],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css'],
})
export class UsersListComponent implements OnInit, OnDestroy {
  private readonly usersService = inject(UsersService);
  private readonly toast = inject(ToastNotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  /**
   * Users list
   */
  readonly users = signal<UserListItem[]>([]);

  /**
   * Selected user IDs
   */
  readonly selectedIds = signal<Set<string>>(new Set());

  /**
   * Loading state
   */
  readonly loading = signal(false);

  /**
   * Total users count
   */
  readonly totalUsers = signal(0);

  /**
   * Current page
   */
  readonly currentPage = signal(1);

  /**
   * Page size
   */
  readonly pageSize = signal(10);

  /**
   * Total pages
   */
  readonly totalPages = signal(0);

  /**
   * Current filters
   */
  readonly filters = signal<UserListFilters>({});

  /**
   * Sort by field
   */
  readonly sortBy = signal<string>('createdAt');

  /**
   * Sort order
   */
  readonly sortOrder = signal<'asc' | 'desc'>('desc');

  /**
   * Computed: selected count
   */
  readonly selectedCount = computed(() => this.selectedIds().size);

  /**
   * Computed: has selected users
   */
  readonly hasSelection = computed(() => this.selectedCount() > 0);

  /**
   * Computed: current pagination
   */
  readonly pagination = computed(() => ({
    page: this.currentPage(),
    pageSize: this.pageSize(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
  }));

  /**
   * Computed: end index for pagination display
   */
  readonly paginationEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalUsers())
  );

  /**
   * Computed: start index for pagination display
   */
  readonly paginationStart = computed(() =>
    (this.currentPage() - 1) * this.pageSize() + 1
  );

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load users with current filters and pagination
   */
  loadUsers(): void {
    this.loading.set(true);

    this.usersService
      .getAll(this.pagination(), this.filters())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.users.set(response.items);
          this.totalUsers.set(response.total);
          this.totalPages.set(response.totalPages);
          this.loading.set(false);
        },
        error: (error) => {
          this.toast.error('Failed to load users: ' + error.message);
          this.loading.set(false);
        },
      });
  }

  /**
   * Handle filters change
   */
  onFiltersChange(newFilters: UserListFilters): void {
    this.filters.set(newFilters);
    this.currentPage.set(1);
    this.loadUsers();
  }

  /**
   * Handle reset filters
   */
  onResetFilters(): void {
    this.filters.set({});
    this.currentPage.set(1);
    this.loadUsers();
  }

  /**
   * Handle selection change
   */
  onSelectionChange(selected: Set<string>): void {
    this.selectedIds.set(selected);
  }

  /**
   * Handle page change
   */
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadUsers();
  }

  /**
   * Handle sort change
   */
  onSortChange(sort: { sortBy: string; sortOrder: 'asc' | 'desc' }): void {
    this.sortBy.set(sort.sortBy);
    this.sortOrder.set(sort.sortOrder);
    this.loadUsers();
  }

  /**
   * Handle view user
   */
  onViewUser(userId: string): void {
    this.router.navigate(['/users', userId]);
  }

  /**
   * Handle edit role
   */
  onEditRole(userId: string): void {
    const user = this.users().find((u) => u.id === userId);
    if (!user) return;

    const dialogRef = this.dialog.open(ChangeRoleDialogComponent, {
      data: { userId: user.id, userName: user.fullName, currentRole: user.role },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.usersService.updateUserRole(userId, result).subscribe({
          next: () => {
            this.toast.success('Role updated successfully');
            this.loadUsers();
          },
          error: (error) => {
            this.toast.error('Failed to update role: ' + error.message);
          },
        });
      }
    });
  }

  /**
   * Handle deactivate/activate user
   */
  onDeactivateUser(userId: string): void {
    const user = this.users().find((u) => u.id === userId);
    if (!user) return;

    const dialogRef = this.dialog.open(DeactivateUserDialogComponent, {
      data: { userId: user.id, userName: user.fullName, currentStatus: user.status },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const action = user.status === 'ACTIVE'
          ? this.usersService.deactivateUser(userId)
          : this.usersService.activateUser(userId);

        action.subscribe({
          next: () => {
            this.toast.success(`User ${user.status === 'ACTIVE' ? 'deactivated' : 'activated'} successfully`);
            this.loadUsers();
          },
          error: (error) => {
            this.toast.error('Failed to update user: ' + error.message);
          },
        });
      }
    });
  }

  /**
   * Handle delete user
   */
  onDeleteUser(userId: string): void {
    const user = this.users().find((u) => u.id === userId);
    if (!user) return;

    const dialogRef = this.dialog.open(DeleteUserDialogComponent, {
      data: { userId: user.id, userName: user.fullName },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.usersService.deleteUser(userId).subscribe({
          next: () => {
            this.toast.success('User deleted successfully');
            this.selectedIds.update((selected) => {
              const newSelected = new Set(selected);
              newSelected.delete(userId);
              return newSelected;
            });
            this.loadUsers();
          },
          error: (error) => {
            this.toast.error('Failed to delete user: ' + error.message);
          },
        });
      }
    });
  }

  /**
   * Handle bulk deselect all
   */
  onDeselectAll(): void {
    this.selectedIds.set(new Set());
  }

  /**
   * Handle bulk delete
   */
  onBulkDelete(): void {
    const selected = Array.from(this.selectedIds());
    if (selected.length === 0) return;

    const dialogRef = this.dialog.open(DeleteUserDialogComponent, {
      data: {
        userIds: selected,
        count: selected.length,
        isBulk: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.usersService.bulkDelete(selected).subscribe({
          next: () => {
            this.toast.success(`${selected.length} user(s) deleted successfully`);
            this.selectedIds.set(new Set());
            this.loadUsers();
          },
          error: (error) => {
            this.toast.error('Failed to delete users: ' + error.message);
          },
        });
      }
    });
  }

  /**
   * Handle bulk change role
   */
  onBulkChangeRole(role: UserRole): void {
    const selected = Array.from(this.selectedIds());
    if (selected.length === 0) return;

    const dialogRef = this.dialog.open(ChangeRoleDialogComponent, {
      data: {
        userIds: selected,
        count: selected.length,
        isBulk: true,
        currentRole: role,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.usersService
          .bulkAction({
            userIds: selected,
            action: 'updateRole',
            payload: { role },
          })
          .subscribe({
            next: () => {
              this.toast.success(`${selected.length} user(s) role updated successfully`);
              this.selectedIds.set(new Set());
              this.loadUsers();
            },
            error: (error) => {
              this.toast.error('Failed to update roles: ' + error.message);
            },
          });
      }
    });
  }

  /**
   * Handle bulk change status
   */
  onBulkChangeStatus(status: UserStatus): void {
    const selected = Array.from(this.selectedIds());
    if (selected.length === 0) return;

    const action: 'activate' | 'deactivate' =
      status === 'ACTIVE'
        ? 'activate'
        : 'deactivate';

    this.usersService
      .bulkAction({
        userIds: selected,
        action,
      })
      .subscribe({
        next: () => {
          this.toast.success(
            `${selected.length} user(s) ${status.toLowerCase()} successfully`
          );
          this.selectedIds.set(new Set());
          this.loadUsers();
        },
        error: (error) => {
          this.toast.error('Failed to update status: ' + error.message);
        },
      });
  }

  /**
   * Handle export to CSV
   */
  onExportToCsv(): void {
    this.usersService.exportToCsv(this.filters()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${new Date().toISOString()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('Users exported successfully');
      },
      error: (error) => {
        this.toast.error('Failed to export users: ' + error.message);
      },
    });
  }

  /**
   * Handle refresh
   */
  onRefresh(): void {
    this.loadUsers();
  }
}
