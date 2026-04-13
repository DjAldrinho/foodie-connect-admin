import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import type { BackupSettings } from '../../../models/settings.types';

@Component({
  selector: 'app-backup-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './backup-settings.component.html',
  styleUrls: ['./backup-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackupSettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isCreating = signal(false);
  readonly isRestoring = signal(false);
  readonly saveSuccess = signal(false);
  readonly createSuccess = signal<{ success: boolean; message: string; backupUrl?: string } | null>(null);
  readonly selectedFile = signal<File | null>(null);

  readonly autoBackupEnabled = signal(true);
  readonly backupFrequency = signal<'daily' | 'weekly' | 'monthly'>('daily');
  readonly backupRetentionDays = signal(30);
  readonly lastBackupAt = signal<Date | null>(null);
  readonly nextBackupAt = signal<Date | null>(null);

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading.set(true);
    this.settingsService.getBackupSettings().subscribe({
      next: (data: BackupSettings) => {
        this.autoBackupEnabled.set(data.autoBackupEnabled);
        this.backupFrequency.set(data.backupFrequency);
        this.backupRetentionDays.set(data.backupRetentionDays);
        this.lastBackupAt.set(data.lastBackupAt || null);
        this.nextBackupAt.set(data.nextBackupAt || null);
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
      .updateBackupSettings({
        autoBackupEnabled: this.autoBackupEnabled(),
        backupFrequency: this.backupFrequency(),
        backupRetentionDays: this.backupRetentionDays(),
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

  createBackup(): void {
    this.isCreating.set(true);
    this.createSuccess.set(null);

    this.settingsService.createBackup().subscribe({
      next: (result) => {
        this.isCreating.set(false);
        this.createSuccess.set(result);
        this.loadSettings();
        setTimeout(() => this.createSuccess.set(null), 10000);
      },
      error: () => {
        this.isCreating.set(false);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  restoreBackup(): void {
    if (!this.selectedFile()) {
      return;
    }

    if (!confirm('Are you sure you want to restore from backup? This will overwrite all current data.')) {
      return;
    }

    this.isRestoring.set(true);
    this.settingsService.restoreBackup(this.selectedFile()!).subscribe({
      next: () => {
        this.isRestoring.set(false);
        alert('Backup restored successfully!');
        this.selectedFile.set(null);
      },
      error: () => {
        this.isRestoring.set(false);
        alert('Failed to restore backup');
      },
    });
  }
}
