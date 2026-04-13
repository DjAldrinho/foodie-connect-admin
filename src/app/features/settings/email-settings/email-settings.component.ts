/**
 * Email Settings Component
 * Configure SMTP settings and test email functionality
 */

import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import type { EmailSettings } from '../../../models/settings.types';

@Component({
  selector: 'app-email-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './email-settings.component.html',
  styleUrls: ['./email-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailSettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isTesting = signal(false);
  readonly saveSuccess = signal(false);
  readonly testSuccess = signal<{ success: boolean; message: string } | null>(null);

  readonly smtpHost = signal('');
  readonly smtpPort = signal(587);
  readonly smtpUser = signal('');
  readonly smtpPassword = signal('');
  readonly fromEmail = signal('');
  readonly fromName = signal('');
  readonly secureConnection = signal(true);

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading.set(true);
    this.settingsService.getEmailSettings().subscribe({
      next: (data: EmailSettings) => {
        this.smtpHost.set(data.smtpHost);
        this.smtpPort.set(data.smtpPort);
        this.smtpUser.set(data.smtpUser);
        this.smtpPassword.set(data.smtpPassword);
        this.fromEmail.set(data.fromEmail);
        this.fromName.set(data.fromName);
        this.secureConnection.set(data.secureConnection);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  saveSettings(): void {
    this.isSaving.set(true);
    this.saveSuccess.set(false);

    this.settingsService
      .updateEmailSettings({
        smtpHost: this.smtpHost(),
        smtpPort: this.smtpPort(),
        smtpUser: this.smtpUser(),
        smtpPassword: this.smtpPassword(),
        fromEmail: this.fromEmail(),
        fromName: this.fromName(),
        secureConnection: this.secureConnection(),
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.saveSuccess.set(true);
          setTimeout(() => this.saveSuccess.set(false), 3000);
        },
        error: () => {
          this.isSaving.set(false);
        },
      });
  }

  testEmail(): void {
    this.isTesting.set(true);
    this.testSuccess.set(null);

    this.settingsService.testEmail().subscribe({
      next: (result) => {
        this.isTesting.set(false);
        this.testSuccess.set(result);
        setTimeout(() => this.testSuccess.set(null), 5000);
      },
      error: () => {
        this.isTesting.set(false);
        this.testSuccess.set({ success: false, message: 'Failed to send test email' });
      },
    });
  }
}
