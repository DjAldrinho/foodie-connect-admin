import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import type { SecuritySettings } from '../../../models/settings.types';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './security-settings.component.html',
  styleUrls: ['./security-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecuritySettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly saveSuccess = signal(false);

  readonly sessionTimeout = signal(30);
  readonly passwordMinLength = signal(8);
  readonly passwordRequireUppercase = signal(true);
  readonly passwordRequireLowercase = signal(true);
  readonly passwordRequireNumbers = signal(true);
  readonly passwordRequireSpecialChars = signal(true);
  readonly twoFactorAuthEnabled = signal(false);
  readonly maxLoginAttempts = signal(5);
  readonly lockoutDuration = signal(15);

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading.set(true);
    this.settingsService.getSecuritySettings().subscribe({
      next: (data: SecuritySettings) => {
        this.sessionTimeout.set(data.sessionTimeout);
        this.passwordMinLength.set(data.passwordMinLength);
        this.passwordRequireUppercase.set(data.passwordRequireUppercase);
        this.passwordRequireLowercase.set(data.passwordRequireLowercase);
        this.passwordRequireNumbers.set(data.passwordRequireNumbers);
        this.passwordRequireSpecialChars.set(data.passwordRequireSpecialChars);
        this.twoFactorAuthEnabled.set(data.twoFactorAuthEnabled);
        this.maxLoginAttempts.set(data.maxLoginAttempts);
        this.lockoutDuration.set(data.lockoutDuration);
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
      .updateSecuritySettings({
        sessionTimeout: this.sessionTimeout(),
        passwordMinLength: this.passwordMinLength(),
        passwordRequireUppercase: this.passwordRequireUppercase(),
        passwordRequireLowercase: this.passwordRequireLowercase(),
        passwordRequireNumbers: this.passwordRequireNumbers(),
        passwordRequireSpecialChars: this.passwordRequireSpecialChars(),
        twoFactorAuthEnabled: this.twoFactorAuthEnabled(),
        maxLoginAttempts: this.maxLoginAttempts(),
        lockoutDuration: this.lockoutDuration(),
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
}
