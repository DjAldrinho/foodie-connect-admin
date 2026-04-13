/**
 * Settings Service
 * Handles all settings operations with mock data
 */

import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import type {
  SiteSettings,
  EmailSettings,
  SecuritySettings,
  IntegrationSettings,
  FeatureFlag,
  ThemeSettings,
  LocalizationSettings,
  CacheSettings,
  BackupSettings,
  AdminUser,
  AuditLog,
  AuditLogQuery,
  AuditLogResponse,
  UpdateSiteSettingsRequest,
  UpdateEmailSettingsRequest,
  UpdateSecuritySettingsRequest,
  UpdateIntegrationSettingsRequest,
  UpdateFeatureFlagRequest,
  UpdateThemeSettingsRequest,
  UpdateLocalizationSettingsRequest,
  UpdateCacheSettingsRequest,
  UpdateBackupSettingsRequest,
  AddAdminRequest,
} from '../../../models/settings.types';

/**
 * Mock settings data
 */
const MOCK_SITE_SETTINGS: SiteSettings = {
  id: '1',
  siteName: 'Foodie Connect',
  siteDescription: 'Discover the best restaurants and food experiences',
  contactEmail: 'contact@foodieconnect.com',
  maintenanceMode: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const MOCK_EMAIL_SETTINGS: EmailSettings = {
  id: '1',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: 'noreply@foodieconnect.com',
  smtpPassword: '********',
  fromEmail: 'noreply@foodieconnect.com',
  fromName: 'Foodie Connect',
  secureConnection: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const MOCK_SECURITY_SETTINGS: SecuritySettings = {
  id: '1',
  sessionTimeout: 30,
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  twoFactorAuthEnabled: false,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const MOCK_INTEGRATION_SETTINGS: IntegrationSettings = {
  id: '1',
  googleMapsApiKey: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  cloudinaryCloudName: 'foodie-connect',
  cloudinaryApiKey: '123456789012345',
  cloudinaryApiSecret: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  elasticsearchHost: 'localhost',
  elasticsearchPort: 9200,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const MOCK_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: '1',
    name: 'new_dashboard',
    description: 'Enable new dashboard design',
    enabled: true,
    rolloutPercentage: 100,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'advanced_search',
    description: 'Enable advanced search features',
    enabled: true,
    rolloutPercentage: 50,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'social_login',
    description: 'Enable social login (Google, Facebook)',
    enabled: false,
    rolloutPercentage: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const MOCK_THEME_SETTINGS: ThemeSettings = {
  id: '1',
  primaryColor: '#FF6B35',
  secondaryColor: '#2E3A59',
  logoUrl: '/assets/logo.png',
  faviconUrl: '/assets/favicon.ico',
  customCss: '',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const MOCK_LOCALIZATION_SETTINGS: LocalizationSettings = {
  id: '1',
  defaultLanguage: 'es',
  defaultTimezone: 'Europe/Madrid',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  currency: 'EUR',
  currencySymbol: '€',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const MOCK_CACHE_SETTINGS: CacheSettings = {
  id: '1',
  defaultTTL: 3600,
  userCacheTTL: 1800,
  restaurantCacheTTL: 7200,
  searchCacheTTL: 900,
  enableQueryCache: true,
  enableResultCache: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const MOCK_BACKUP_SETTINGS: BackupSettings = {
  id: '1',
  autoBackupEnabled: true,
  backupFrequency: 'daily',
  backupRetentionDays: 30,
  lastBackupAt: new Date(Date.now() - 86400000),
  nextBackupAt: new Date(Date.now() + 86400000),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const MOCK_ADMINS: AdminUser[] = [
  {
    id: '1',
    email: 'admin@foodieconnect.com',
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    email: 'moderator@foodieconnect.com',
    name: 'John Moderator',
    role: 'ADMIN',
    createdAt: new Date('2024-01-15'),
    lastLoginAt: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    email: 'support@foodieconnect.com',
    name: 'Jane Support',
    role: 'ADMIN',
    createdAt: new Date('2024-02-01'),
    lastLoginAt: new Date(Date.now() - 86400000),
  },
];

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: '1',
    adminEmail: 'admin@foodieconnect.com',
    adminId: '1',
    action: 'UPDATE_SITE_SETTINGS',
    entityType: 'SiteSettings',
    entityId: '1',
    changes: {
      siteName: { old: 'Foodie', new: 'Foodie Connect' },
      contactEmail: { old: 'old@foodie.com', new: 'contact@foodieconnect.com' },
    },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    adminEmail: 'admin@foodieconnect.com',
    adminId: '1',
    action: 'ADD_ADMIN',
    entityType: 'AdminUser',
    entityId: '3',
    changes: {
      email: { old: null, new: 'support@foodieconnect.com' },
      role: { old: null, new: 'ADMIN' },
    },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    adminEmail: 'moderator@foodieconnect.com',
    adminId: '2',
    action: 'UPDATE_RESTAURANT',
    entityType: 'Restaurant',
    entityId: '123',
    changes: {
      verified: { old: false, new: true },
    },
    ipAddress: '192.168.1.2',
    userAgent: 'Mozilla/5.0...',
    timestamp: new Date(Date.now() - 86400000),
  },
];

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  // Signals for state management
  readonly siteSettings = signal<SiteSettings | null>(null);
  readonly emailSettings = signal<EmailSettings | null>(null);
  readonly securitySettings = signal<SecuritySettings | null>(null);
  readonly integrationSettings = signal<IntegrationSettings | null>(null);
  readonly featureFlags = signal<FeatureFlag[]>([]);
  readonly themeSettings = signal<ThemeSettings | null>(null);
  readonly localizationSettings = signal<LocalizationSettings | null>(null);
  readonly cacheSettings = signal<CacheSettings | null>(null);
  readonly backupSettings = signal<BackupSettings | null>(null);
  readonly admins = signal<AdminUser[]>([]);

  constructor() {
    this.loadMockData();
  }

  /**
   * Load mock data
   */
  private loadMockData(): void {
    this.siteSettings.set(MOCK_SITE_SETTINGS);
    this.emailSettings.set(MOCK_EMAIL_SETTINGS);
    this.securitySettings.set(MOCK_SECURITY_SETTINGS);
    this.integrationSettings.set(MOCK_INTEGRATION_SETTINGS);
    this.featureFlags.set(MOCK_FEATURE_FLAGS);
    this.themeSettings.set(MOCK_THEME_SETTINGS);
    this.localizationSettings.set(MOCK_LOCALIZATION_SETTINGS);
    this.cacheSettings.set(MOCK_CACHE_SETTINGS);
    this.backupSettings.set(MOCK_BACKUP_SETTINGS);
    this.admins.set(MOCK_ADMINS);
  }

  /**
   * Site Settings
   */
  getSiteSettings(): Observable<SiteSettings> {
    return of(MOCK_SITE_SETTINGS).pipe(delay(300));
  }

  updateSiteSettings(data: UpdateSiteSettingsRequest): Observable<SiteSettings> {
    const updated = { ...MOCK_SITE_SETTINGS, ...data, updatedAt: new Date() };
    this.siteSettings.set(updated);
    return of(updated).pipe(delay(500));
  }

  /**
   * Email Settings
   */
  getEmailSettings(): Observable<EmailSettings> {
    return of(MOCK_EMAIL_SETTINGS).pipe(delay(300));
  }

  updateEmailSettings(data: UpdateEmailSettingsRequest): Observable<EmailSettings> {
    const updated = { ...MOCK_EMAIL_SETTINGS, ...data, updatedAt: new Date() };
    this.emailSettings.set(updated);
    return of(updated).pipe(delay(500));
  }

  testEmail(): Observable<{ success: boolean; message: string }> {
    return of({ success: true, message: 'Test email sent successfully' }).pipe(delay(1000));
  }

  /**
   * Security Settings
   */
  getSecuritySettings(): Observable<SecuritySettings> {
    return of(MOCK_SECURITY_SETTINGS).pipe(delay(300));
  }

  updateSecuritySettings(data: UpdateSecuritySettingsRequest): Observable<SecuritySettings> {
    const updated = { ...MOCK_SECURITY_SETTINGS, ...data, updatedAt: new Date() };
    this.securitySettings.set(updated);
    return of(updated).pipe(delay(500));
  }

  /**
   * Integration Settings
   */
  getIntegrationSettings(): Observable<IntegrationSettings> {
    return of(MOCK_INTEGRATION_SETTINGS).pipe(delay(300));
  }

  updateIntegrationSettings(
    data: UpdateIntegrationSettingsRequest
  ): Observable<IntegrationSettings> {
    const updated = { ...MOCK_INTEGRATION_SETTINGS, ...data, updatedAt: new Date() };
    this.integrationSettings.set(updated);
    return of(updated).pipe(delay(500));
  }

  /**
   * Feature Flags
   */
  getFeatureFlags(): Observable<FeatureFlag[]> {
    return of(MOCK_FEATURE_FLAGS).pipe(delay(300));
  }

  updateFeatureFlag(id: string, data: UpdateFeatureFlagRequest): Observable<FeatureFlag> {
    const index = MOCK_FEATURE_FLAGS.findIndex((f) => f.id === id);
    if (index !== -1) {
      const updated = { ...MOCK_FEATURE_FLAGS[index], ...data, updatedAt: new Date() };
      MOCK_FEATURE_FLAGS[index] = updated;
      this.featureFlags.set([...MOCK_FEATURE_FLAGS]);
      return of(updated).pipe(delay(500));
    }
    throw new Error('Feature flag not found');
  }

  /**
   * Theme Settings
   */
  getThemeSettings(): Observable<ThemeSettings> {
    return of(MOCK_THEME_SETTINGS).pipe(delay(300));
  }

  updateThemeSettings(data: UpdateThemeSettingsRequest): Observable<ThemeSettings> {
    const updated = { ...MOCK_THEME_SETTINGS, ...data, updatedAt: new Date() };
    this.themeSettings.set(updated);
    return of(updated).pipe(delay(500));
  }

  /**
   * Localization Settings
   */
  getLocalizationSettings(): Observable<LocalizationSettings> {
    return of(MOCK_LOCALIZATION_SETTINGS).pipe(delay(300));
  }

  updateLocalizationSettings(
    data: UpdateLocalizationSettingsRequest
  ): Observable<LocalizationSettings> {
    const updated = { ...MOCK_LOCALIZATION_SETTINGS, ...data, updatedAt: new Date() };
    this.localizationSettings.set(updated);
    return of(updated).pipe(delay(500));
  }

  /**
   * Cache Settings
   */
  getCacheSettings(): Observable<CacheSettings> {
    return of(MOCK_CACHE_SETTINGS).pipe(delay(300));
  }

  updateCacheSettings(data: UpdateCacheSettingsRequest): Observable<CacheSettings> {
    const updated = { ...MOCK_CACHE_SETTINGS, ...data, updatedAt: new Date() };
    this.cacheSettings.set(updated);
    return of(updated).pipe(delay(500));
  }

  clearCache(): Observable<{ success: boolean; message: string }> {
    return of({ success: true, message: 'Cache cleared successfully' }).pipe(delay(1000));
  }

  /**
   * Backup Settings
   */
  getBackupSettings(): Observable<BackupSettings> {
    return of(MOCK_BACKUP_SETTINGS).pipe(delay(300));
  }

  updateBackupSettings(data: UpdateBackupSettingsRequest): Observable<BackupSettings> {
    const updated = { ...MOCK_BACKUP_SETTINGS, ...data, updatedAt: new Date() };
    this.backupSettings.set(updated);
    return of(updated).pipe(delay(500));
  }

  createBackup(): Observable<{ success: boolean; message: string; backupUrl: string }> {
    return of({
      success: true,
      message: 'Backup created successfully',
      backupUrl: '/backups/backup-' + Date.now() + '.sql',
    }).pipe(delay(2000));
  }

  restoreBackup(backupFile: File): Observable<{ success: boolean; message: string }> {
    return of({ success: true, message: 'Backup restored successfully' }).pipe(delay(3000));
  }

  /**
   * Admin Management
   */
  getAdmins(): Observable<AdminUser[]> {
    return of(MOCK_ADMINS).pipe(delay(300));
  }

  addAdmin(data: AddAdminRequest): Observable<AdminUser> {
    const newAdmin: AdminUser = {
      id: String(MOCK_ADMINS.length + 1),
      email: data.email,
      name: data.email.split('@')[0],
      role: data.role,
      createdAt: new Date(),
    };
    MOCK_ADMINS.push(newAdmin);
    this.admins.set([...MOCK_ADMINS]);
    return of(newAdmin).pipe(delay(500));
  }

  removeAdmin(id: string): Observable<{ success: boolean; message: string }> {
    const index = MOCK_ADMINS.findIndex((a) => a.id === id);
    if (index !== -1) {
      MOCK_ADMINS.splice(index, 1);
      this.admins.set([...MOCK_ADMINS]);
      return of({ success: true, message: 'Admin removed successfully' }).pipe(delay(500));
    }
    throw new Error('Admin not found');
  }

  /**
   * Audit Logs
   */
  getAuditLogs(query: AuditLogQuery): Observable<AuditLogResponse> {
    let filteredLogs = [...MOCK_AUDIT_LOGS];

    // Filter by admin
    if (query.adminId) {
      filteredLogs = filteredLogs.filter((log) => log.adminId === query.adminId);
    }

    // Filter by action
    if (query.action) {
      filteredLogs = filteredLogs.filter((log) => log.action === query.action);
    }

    // Filter by entity type
    if (query.entityType) {
      filteredLogs = filteredLogs.filter((log) => log.entityType === query.entityType);
    }

    // Filter by date range
    if (query.startDate) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp >= query.startDate!);
    }
    if (query.endDate) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp <= query.endDate!);
    }

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + limit);

    const response: AuditLogResponse = {
      logs: paginatedLogs,
      total: filteredLogs.length,
      page,
      limit,
      totalPages: Math.ceil(filteredLogs.length / limit),
    };

    return of(response).pipe(delay(300));
  }

  exportAuditLogs(query: AuditLogQuery): Observable<Blob> {
    const mockData = {
      exportedAt: new Date(),
      query,
      logs: MOCK_AUDIT_LOGS,
    };

    const json = JSON.stringify(mockData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    return of(blob).pipe(delay(500));
  }
}
