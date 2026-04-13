/**
 * Compose Notification Component
 * Form for creating new notifications
 */

import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { NotificationsService } from '../services/notifications.service';
import { ToastNotificationService } from '../../../core/services/toast-notification.service';

import type { CreateNotificationRequest } from '../../../models/notifications.types';
import {
  NotificationType,
  NotificationPriority,
  NotificationTarget,
} from '../../../models/notifications.types';

/**
 * Compose Notification Component
 *
 * Form for creating and sending new notifications to users.
 * Supports different types, priorities, and target audiences.
 */
@Component({
  selector: 'app-compose-notification',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './compose-notification.component.html',
  styleUrls: ['./compose-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComposeNotificationComponent {
  private readonly notificationsService = inject(NotificationsService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly router = inject(Router);

  // Type assertion for toast service
  private readonly toast = this.toastService as unknown as {
    success: (message: string) => void;
    error: (message: string) => void;
  };

  // Signals
  readonly isSubmitting = signal(false);
  readonly showPreview = signal(false);

  // Form
  readonly form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]),
    message: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]),
    type: new FormControl(NotificationType.INFO, [Validators.required]),
    priority: new FormControl(NotificationPriority.NORMAL, [Validators.required]),
    target: new FormControl(NotificationTarget.ALL_USERS, [Validators.required]),
    targetRoles: new FormControl<string[]>([]),
    targetUserIds: new FormControl<string[]>([]),
    sendNow: new FormControl(true, [Validators.required]),
    scheduledFor: new FormControl<Date | null>(null),
  });

  // Form options
  readonly notificationTypes = Object.values(NotificationType);
  readonly priorities = Object.values(NotificationPriority);
  readonly targets = Object.values(NotificationTarget);

  // Computed properties
  readonly needsRoleSelection = signal(false);
  readonly needsUserIds = signal(false);

  constructor() {
    // Watch target changes to show/hide additional fields
    this.form.get('target')?.valueChanges.subscribe((target) => {
      this.needsRoleSelection.set(target === NotificationTarget.ROLE);
      this.needsUserIds.set(target === NotificationTarget.SPECIFIC_USERS);
    });
  }

  /**
   * Get form controls
   */
  get f() {
    return this.form.controls;
  }

  /**
   * Toggle preview
   */
  togglePreview(): void {
    this.showPreview.update((show) => !show);
  }

  /**
   * Submit form
   */
  submit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      this.toast.error('Please fix the errors in the form');
      return;
    }

    this.isSubmitting.set(true);

    const request: CreateNotificationRequest = {
      title: this.form.value.title!,
      message: this.form.value.message!,
      type: this.form.value.type!,
      priority: this.form.value.priority!,
      target: this.form.value.target!,
      targetRoles: this.form.value.targetRoles || undefined,
      targetUserIds: this.form.value.targetUserIds || undefined,
      scheduledFor: this.form.value.scheduledFor || undefined,
      sendNow: this.form.value.sendNow!,
    };

    this.notificationsService.createNotification(request).subscribe({
      next: () => {
        this.toast.success('Notification created successfully');
        this.router.navigate(['/notifications']);
      },
      error: (error: Error) => {
        this.toast.error(error.message || 'Failed to create notification');
        this.isSubmitting.set(false);
      },
    });
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/notifications']);
  }

  /**
   * Get preview data
   */
  getPreviewData(): CreateNotificationRequest | null {
    if (this.form.invalid) {
      return null;
    }

    return {
      title: this.form.value.title || '',
      message: this.form.value.message || '',
      type: this.form.value.type || NotificationType.INFO,
      priority: this.form.value.priority || NotificationPriority.NORMAL,
      target: this.form.value.target || NotificationTarget.ALL_USERS,
      sendNow: this.form.value.sendNow || true,
    };
  }

  /**
   * Mark all form controls as touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Get type display name
   */
  getTypeDisplayName(type: NotificationType): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  }

  /**
   * Get priority display name
   */
  getPriorityDisplayName(priority: NotificationPriority): string {
    return priority.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  }

  /**
   * Get target display name
   */
  getTargetDisplayName(target: NotificationTarget): string {
    return target.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  }
}
