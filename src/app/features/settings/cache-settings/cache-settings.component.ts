import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import type { CacheSettings } from '../../../models/settings.types';

@Component({
  selector: 'app-cache-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cache-settings.component.html',
  styleUrls: ['./cache-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CacheSettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isClearing = signal(false);
  readonly saveSuccess = signal(false);
  readonly clearSuccess = signal<{ success: boolean; message: string } | null>(null);

  readonly defaultTTL = signal(3600);
  readonly userCacheTTL = signal(1800);
  readonly restaurantCacheTTL = signal(7200);
  readonly searchCacheTTL = signal(900);
  readonly enableQueryCache = signal(true);
  readonly enableResultCache = signal(true);

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading.set(true);
    this.settingsService.getCacheSettings().subscribe({
      next: (data: CacheSettings) => {
        this.defaultTTL.set(data.defaultTTL);
        this.userCacheTTL.set(data.userCacheTTL);
        this.restaurantCacheTTL.set(data.restaurantCacheTTL);
        this.searchCacheTTL.set(data.searchCacheTTL);
        this.enableQueryCache.set(data.enableQueryCache);
        this.enableResultCache.set(data.enableResultCache);
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
      .updateCacheSettings({
        defaultTTL: this.defaultTTL(),
        userCacheTTL: this.userCacheTTL(),
        restaurantCacheTTL: this.restaurantCacheTTL(),
        searchCacheTTL: this.searchCacheTTL(),
        enableQueryCache: this.enableQueryCache(),
        enableResultCache: this.enableResultCache(),
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

  clearCache(): void {
    this.isClearing.set(true);
    this.clearSuccess.set(null);

    this.settingsService.clearCache().subscribe({
      next: (result) => {
        this.isClearing.set(false);
        this.clearSuccess.set(result);
        setTimeout(() => this.clearSuccess.set(null), 5000);
      },
      error: () => {
        this.isClearing.set(false);
      },
    });
  }
}
