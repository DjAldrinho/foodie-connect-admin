import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import type { IntegrationSettings } from '../../../models/settings.types';

@Component({
  selector: 'app-integration-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './integration-settings.component.html',
  styleUrls: ['./integration-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationSettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly saveSuccess = signal(false);

  readonly googleMapsApiKey = signal('');
  readonly cloudinaryCloudName = signal('');
  readonly cloudinaryApiKey = signal('');
  readonly cloudinaryApiSecret = signal('');
  readonly elasticsearchHost = signal('');
  readonly elasticsearchPort = signal(9200);

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading.set(true);
    this.settingsService.getIntegrationSettings().subscribe({
      next: (data: IntegrationSettings) => {
        this.googleMapsApiKey.set(data.googleMapsApiKey);
        this.cloudinaryCloudName.set(data.cloudinaryCloudName);
        this.cloudinaryApiKey.set(data.cloudinaryApiKey);
        this.cloudinaryApiSecret.set(data.cloudinaryApiSecret);
        this.elasticsearchHost.set(data.elasticsearchHost);
        this.elasticsearchPort.set(data.elasticsearchPort);
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
      .updateIntegrationSettings({
        googleMapsApiKey: this.googleMapsApiKey(),
        cloudinaryCloudName: this.cloudinaryCloudName(),
        cloudinaryApiKey: this.cloudinaryApiKey(),
        cloudinaryApiSecret: this.cloudinaryApiSecret(),
        elasticsearchHost: this.elasticsearchHost(),
        elasticsearchPort: this.elasticsearchPort(),
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
