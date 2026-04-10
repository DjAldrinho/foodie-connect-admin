/**
 * UserFiltersComponent - Filter controls for users list
 *
 * Features:
 * - Search input (name, email)
 * - Role dropdown (USER, ADMIN, SUPER_ADMIN)
 * - Status dropdown (ACTIVE, INACTIVE, SUSPENDED)
 * - Date range picker (created date)
 * - Reset filters button
 * - Active filter indicators
 * - Collapsible on mobile
 * - Output filter changes to parent
 */

import { Component, output, input, inject, DestroyRef } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { UserListFilters } from '../../../../models/users.types';
import type { UserRole, UserStatus } from '../../../../models/auth.types';

@Component({
  selector: 'app-user-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './user-filters.component.html',
  styleUrls: ['./user-filters.component.css'],
})
export class UserFiltersComponent {
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Initial filters (optional)
   */
  readonly initialFilters = input<UserListFilters>({});

  /**
   * Output when filters change
   */
  readonly filtersChange = output<UserListFilters>();

  /**
   * Output when reset is clicked
   */
  readonly reset = output<void>();

  /**
   * Filter form group
   */
  readonly filterForm = new FormGroup({
    search: new FormControl<string>(''),
    role: new FormControl<UserRole | ''>(''),
    status: new FormControl<UserStatus | ''>(''),
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
  });

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
   * Check if any filter is active
   */
  hasActiveFilters = false;

  constructor() {
    // Subscribe to form value changes
    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.emitFilters();
        this.updateHasActiveFilters();
      });
  }

  /**
   * Emit filter changes
   */
  private emitFilters(): void {
    const formValue = this.filterForm.value;

    const filters: UserListFilters = {};

    if (formValue.search) {
      filters.search = formValue.search;
    }

    if (formValue.role) {
      filters.role = formValue.role;
    }

    if (formValue.status) {
      filters.status = formValue.status;
    }

    if (formValue.startDate) {
      filters.startDate = formValue.startDate.toISOString();
    }

    if (formValue.endDate) {
      filters.endDate = formValue.endDate.toISOString();
    }

    this.filtersChange.emit(filters);
  }

  /**
   * Update hasActiveFilters flag
   */
  private updateHasActiveFilters(): void {
    const formValue = this.filterForm.value;
    this.hasActiveFilters = !!(
      formValue.search ||
      formValue.role ||
      formValue.status ||
      formValue.startDate ||
      formValue.endDate
    );
  }

  /**
   * Reset all filters
   */
  onReset(): void {
    this.filterForm.reset({
      search: '',
      role: '',
      status: '',
      startDate: null,
      endDate: null,
    });
    this.reset.emit();
  }

  /**
   * Clear specific filter
   */
  clearFilter(field: string): void {
    const control = this.filterForm.get(field);
    if (control) {
      control.setValue('');
    }
  }
}
