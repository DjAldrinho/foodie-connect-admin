/**
 * User Dialogs - Modal dialogs for user actions
 *
 * Includes:
 * - ChangeRoleDialogComponent
 * - DeactivateUserDialogComponent
 * - DeleteUserDialogComponent
 */

import { Component, inject, signal, computed } from '@angular/core';
import { MatDialogRef, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import type { UserRole, UserStatus } from '../../../models/auth.types';

/**
 * Change Role Dialog Data
 */
export interface ChangeRoleDialogData {
  userId?: string;
  userIds?: string[];
  userName?: string;
  currentRole: UserRole;
  isBulk?: boolean;
  count?: number;
}

/**
 * Change Role Dialog Component
 */
@Component({
  selector: 'app-change-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-header">
      <mat-icon>admin_panel_settings</mat-icon>
      <span>{{ isBulk ? 'Change Role' : 'Change Role for ' + targetName }}</span>
    </h2>

    <mat-dialog-content>
      @if (isBulk) {
        <p class="dialog-content">
          You are about to change the role for <span class="user-name">{{ targetName }}</span>.
        </p>
      }

      <form [formGroup]="roleForm" class="role-form">
        <mat-form-field appearance="outline" class="role-select">
          <mat-label>New Role</mat-label>
          <mat-select formControlName="role" (selectionChange)="onRoleChange($event.value)">
            @for (option of roleOptions; track option.value) {
              <mat-option [value]="option.value">
                {{ option.label }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <div class="role-description">
          <strong>{{ roleOptions.find(r => r.value === selectedRole())?.label }}:</strong>
          {{ roleDescription() }}
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">
        Change Role
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 400px;
      }
      .dialog-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      .dialog-header mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        color: #3b82f6;
      }
      .role-select {
        width: 100%;
      }
      .role-description {
        margin-top: 0.5rem;
        padding: 0.75rem;
        background: #f3f4f6;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        color: #6b7280;
      }
      .dialog-content {
        color: #6b7280;
        line-height: 1.5;
      }
      .user-name {
        font-weight: 600;
        color: #111827;
      }
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding-top: 1rem;
      }
    `,
  ],
})
export class ChangeRoleDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ChangeRoleDialogComponent>);
  readonly data = inject<ChangeRoleDialogData>(MAT_DIALOG_DATA);

  readonly roleForm: FormGroup = new FormBuilder().group({
    role: [this.data.currentRole, Validators.required],
    reason: [''],
  });

  readonly roleOptions: Array<{ value: UserRole; label: string; description: string }> = [
    {
      value: 'USER' as UserRole,
      label: 'User',
      description: 'Can view content and write reviews',
    },
    {
      value: 'ADMIN' as UserRole,
      label: 'Admin',
      description: 'Can manage users and view reports',
    },
    {
      value: 'SUPER_ADMIN' as UserRole,
      label: 'Super Admin',
      description: 'Full access to all features and settings',
    },
  ];

  readonly selectedRole = signal<UserRole>(this.data.currentRole);
  readonly roleDescription = computed(() => {
    const role = this.selectedRole();
    return this.roleOptions.find((r) => r.value === role)?.description || '';
  });

  readonly isBulk = this.data.isBulk || false;
  readonly targetName = this.isBulk
    ? `${this.data.count} selected users`
    : this.data.userName;

  onRoleChange(role: UserRole): void {
    this.selectedRole.set(role);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.roleForm.valid) {
      this.dialogRef.close({
        role: this.roleForm.value.role,
        reason: this.roleForm.value.reason,
      });
    }
  }
}

/**
 * Deactivate User Dialog Data
 */
export interface DeactivateUserDialogData {
  userId: string;
  userName: string;
  currentStatus: UserStatus;
}

/**
 * Deactivate User Dialog Component
 */
@Component({
  selector: 'app-deactivate-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-header">
      <mat-icon>{{ isDeactivating ? 'person_off' : 'person_add' }}</mat-icon>
      <span>{{ actionTitle }}</span>
    </h2>

    <mat-dialog-content class="dialog-content">
      <p>
        Are you sure you want to {{ actionText }} <span class="user-name">{{ data.userName }}</span>?
      </p>
      @if (isDeactivating) {
        <p>
          The user will not be able to access the system but their data will be preserved.
        </p>
      } @else {
        <p>
          The user will regain access to the system with their previous permissions.
        </p>
      }
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        [color]="isDeactivating ? 'warn' : 'primary'"
        (click)="onConfirm()"
      >
        {{ isDeactivating ? 'Deactivate' : 'Activate' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 400px;
      }
      .dialog-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      .dialog-header mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        color: #f59e0b;
      }
      .dialog-content {
        color: #6b7280;
        line-height: 1.5;
      }
      .user-name {
        font-weight: 600;
        color: #111827;
      }
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding-top: 1rem;
      }
    `,
  ],
})
export class DeactivateUserDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DeactivateUserDialogComponent>);
  readonly data = inject<DeactivateUserDialogData>(MAT_DIALOG_DATA);

  readonly isDeactivating = this.data.currentStatus === 'ACTIVE';
  readonly actionText = this.isDeactivating ? 'deactivate' : 'activate';
  readonly actionTitle = this.isDeactivating ? 'Deactivate User' : 'Activate User';

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

/**
 * Delete User Dialog Data
 */
export interface DeleteUserDialogData {
  userId?: string;
  userIds?: string[];
  userName?: string;
  isBulk?: boolean;
  count?: number;
}

/**
 * Delete User Dialog Component
 */
@Component({
  selector: 'app-delete-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-header">
      <mat-icon>delete</mat-icon>
      <span>{{ isBulk ? 'Delete Users' : 'Delete User' }}</span>
    </h2>

    <mat-dialog-content class="dialog-content">
      @if (isBulk) {
        <p>
          Are you sure you want to delete <span class="user-name">{{ targetName }}</span>?
        </p>
      } @else {
        <p>
          Are you sure you want to delete <span class="user-name">{{ data.userName }}</span>?
        </p>
      }

      <div class="warning-box">
        <strong>Warning:</strong> This action cannot be undone. All user data including reviews,
        photos, and activity will be permanently deleted.
      </div>
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">
        Delete
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 400px;
      }
      .dialog-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      .dialog-header mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        color: #dc2626;
      }
      .dialog-content {
        color: #6b7280;
        line-height: 1.5;
      }
      .user-name {
        font-weight: 600;
        color: #111827;
      }
      .warning-box {
        margin-top: 1rem;
        padding: 0.75rem;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        color: #991b1b;
      }
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding-top: 1rem;
      }
    `,
  ],
})
export class DeleteUserDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DeleteUserDialogComponent>);
  readonly data = inject<DeleteUserDialogData>(MAT_DIALOG_DATA);

  readonly isBulk = this.data.isBulk || false;
  readonly targetName = this.isBulk
    ? `${this.data.count} selected users`
    : this.data.userName;

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
