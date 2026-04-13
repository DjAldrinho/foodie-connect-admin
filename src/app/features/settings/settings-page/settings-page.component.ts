/**
 * Settings Page Component
 * Main settings page with accordion navigation
 */

import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiteSettingsComponent } from '../site-settings/site-settings.component';
import { EmailSettingsComponent } from '../email-settings/email-settings.component';
import { SecuritySettingsComponent } from '../security-settings/security-settings.component';
import { AdminManagementComponent } from '../admin-management/admin-management.component';
import { AuditLogsComponent } from '../audit-logs/audit-logs.component';
import { IntegrationSettingsComponent } from '../integration-settings/integration-settings.component';
import { FeatureFlagsComponent } from '../feature-flags/feature-flags.component';
import { ThemeSettingsComponent } from '../theme-settings/theme-settings.component';
import { LocalizationSettingsComponent } from '../localization-settings/localization-settings.component';
import { CacheSettingsComponent } from '../cache-settings/cache-settings.component';
import { BackupSettingsComponent } from '../backup-settings/backup-settings.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SiteSettingsComponent,
    EmailSettingsComponent,
    SecuritySettingsComponent,
    AdminManagementComponent,
    AuditLogsComponent,
    IntegrationSettingsComponent,
    FeatureFlagsComponent,
    ThemeSettingsComponent,
    LocalizationSettingsComponent,
    CacheSettingsComponent,
    BackupSettingsComponent,
  ],
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  // Signals
  readonly activeSection = signal<string>('site');

  // Sections configuration
  readonly sections = [
    { id: 'site', label: 'Site Settings', icon: '🌐' },
    { id: 'email', label: 'Email Settings', icon: '📧' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'admins', label: 'Admin Management', icon: '👥' },
    { id: 'audit', label: 'Audit Logs', icon: '📋' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'features', label: 'Feature Flags', icon: '🚩' },
    { id: 'theme', label: 'Theme', icon: '🎨' },
    { id: 'localization', label: 'Localization', icon: '🌍' },
    { id: 'cache', label: 'Cache', icon: '💾' },
    { id: 'backup', label: 'Backup', icon: '💿' },
  ];

  /**
   * Set active section
   */
  setActiveSection(sectionId: string): void {
    this.activeSection.set(sectionId);
  }

  /**
   * Check if section is active
   */
  isSectionActive(sectionId: string): boolean {
    return this.activeSection() === sectionId;
  }
}
