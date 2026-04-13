import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import type { LocalizationSettings } from '../../../models/settings.types';

@Component({
  selector: 'app-localization-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './localization-settings.component.html',
  styleUrls: ['./localization-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalizationSettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly saveSuccess = signal(false);

  readonly defaultLanguage = signal('es');
  readonly defaultTimezone = signal('Europe/Madrid');
  readonly dateFormat = signal('DD/MM/YYYY');
  readonly timeFormat = signal<'12h' | '24h'>('24h');
  readonly currency = signal('EUR');
  readonly currencySymbol = signal('€');

  readonly languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ];

  readonly timezones = [
    'Europe/Madrid',
    'Europe/London',
    'Europe/Paris',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Tokyo',
  ];

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading.set(true);
    this.settingsService.getLocalizationSettings().subscribe({
      next: (data: LocalizationSettings) => {
        this.defaultLanguage.set(data.defaultLanguage);
        this.defaultTimezone.set(data.defaultTimezone);
        this.dateFormat.set(data.dateFormat);
        this.timeFormat.set(data.timeFormat);
        this.currency.set(data.currency);
        this.currencySymbol.set(data.currencySymbol);
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
      .updateLocalizationSettings({
        defaultLanguage: this.defaultLanguage(),
        defaultTimezone: this.defaultTimezone(),
        dateFormat: this.dateFormat(),
        timeFormat: this.timeFormat(),
        currency: this.currency(),
        currencySymbol: this.currencySymbol(),
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
