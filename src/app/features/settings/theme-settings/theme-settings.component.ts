import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import type { ThemeSettings } from '../../../models/settings.types';

@Component({
  selector: 'app-theme-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './theme-settings.component.html',
  styleUrls: ['./theme-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly saveSuccess = signal(false);

  readonly primaryColor = signal('#FF6B35');
  readonly secondaryColor = signal('#2E3A59');
  readonly logoUrl = signal('');
  readonly faviconUrl = signal('');
  readonly customCss = signal('');

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading.set(true);
    this.settingsService.getThemeSettings().subscribe({
      next: (data: ThemeSettings) => {
        this.primaryColor.set(data.primaryColor);
        this.secondaryColor.set(data.secondaryColor);
        this.logoUrl.set(data.logoUrl);
        this.faviconUrl.set(data.faviconUrl);
        this.customCss.set(data.customCss);
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
      .updateThemeSettings({
        primaryColor: this.primaryColor(),
        secondaryColor: this.secondaryColor(),
        logoUrl: this.logoUrl(),
        faviconUrl: this.faviconUrl(),
        customCss: this.customCss(),
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
