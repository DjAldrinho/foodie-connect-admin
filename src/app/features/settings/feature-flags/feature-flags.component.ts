import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import type { FeatureFlag } from '../../../models/settings.types';

@Component({
  selector: 'app-feature-flags',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './feature-flags.component.html',
  styleUrls: ['./feature-flags.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureFlagsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  readonly isLoading = signal(false);
  readonly isUpdating = signal(false);
  readonly featureFlags = signal<FeatureFlag[]>([]);

  ngOnInit(): void {
    this.loadFlags();
  }

  loadFlags(): void {
    this.isLoading.set(true);
    this.settingsService.getFeatureFlags().subscribe({
      next: (data: FeatureFlag[]) => {
        this.featureFlags.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  toggleFlag(flag: FeatureFlag): void {
    this.isUpdating.set(true);
    this.settingsService
      .updateFeatureFlag(flag.id, { enabled: !flag.enabled, rolloutPercentage: flag.rolloutPercentage })
      .subscribe({
        next: () => {
          this.loadFlags();
          this.isUpdating.set(false);
        },
        error: () => {
          this.isUpdating.set(false);
        },
      });
  }

  updateRollout(flag: FeatureFlag, percentage: number): void {
    this.isUpdating.set(true);
    this.settingsService.updateFeatureFlag(flag.id, { enabled: flag.enabled, rolloutPercentage: percentage }).subscribe({
      next: () => {
        this.loadFlags();
        this.isUpdating.set(false);
      },
      error: () => {
        this.isUpdating.set(false);
      },
    });
  }
}
