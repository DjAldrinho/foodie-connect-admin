/**
 * Site Settings Component
 * Configure site name, description, contact email, and maintenance mode
 */

import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import type { SiteSettings } from '../../../models/settings.types';

@Component({
  selector: 'app-site-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './site-settings.component.html',
  styleUrls: ['./site-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteSettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly saveSuccess = signal(false);

  readonly siteName = signal('');
  readonly siteDescription = signal('');
  readonly contactEmail = signal('');
  readonly maintenanceMode = signal(false);

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading.set(true);
    this.settingsService.getSiteSettings().subscribe({
      next: (data: SiteSettings) => {
        this.siteName.set(data.siteName);
        this.siteDescription.set(data.siteDescription);
        this.contactEmail.set(data.contactEmail);
        this.maintenanceMode.set(data.maintenanceMode);
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
      .updateSiteSettings({
        siteName: this.siteName(),
        siteDescription: this.siteDescription(),
        contactEmail: this.contactEmail(),
        maintenanceMode: this.maintenanceMode(),
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
