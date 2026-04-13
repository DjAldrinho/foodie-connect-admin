/**
 * Settings Types
 * All types related to settings management
 */

/**
 * Site Settings
 */
export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maintenanceMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email Settings
 */
export interface EmailSettings {
  id: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  secureConnection: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Security Settings
 */
export interface SecuritySettings {
  id: string;
  sessionTimeout: number; // in minutes
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  twoFactorAuthEnabled: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Integration Settings
 */
export interface IntegrationSettings {
  id: string;
  googleMapsApiKey: string;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  elasticsearchHost: string;
  elasticsearchPort: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Feature Flag
 */
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Theme Settings
 */
export interface ThemeSettings {
  id: string;
  primaryColor: string; // hex
  secondaryColor: string; // hex
  logoUrl: string;
  faviconUrl: string;
  customCss: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Localization Settings
 */
export interface LocalizationSettings {
  id: string;
  defaultLanguage: string;
  defaultTimezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  currencySymbol: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cache Settings
 */
export interface CacheSettings {
  id: string;
  defaultTTL: number; // in seconds
  userCacheTTL: number;
  restaurantCacheTTL: number;
  searchCacheTTL: number;
  enableQueryCache: boolean;
  enableResultCache: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Backup Settings
 */
export interface BackupSettings {
  id: string;
  autoBackupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupRetentionDays: number;
  lastBackupAt?: Date;
  nextBackupAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Admin User
 */
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  createdAt: Date;
  lastLoginAt?: Date;
}

/**
 * Audit Log
 */
export interface AuditLog {
  id: string;
  adminEmail: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Update Site Settings Request
 */
export interface UpdateSiteSettingsRequest {
  siteName?: string;
  siteDescription?: string;
  contactEmail?: string;
  maintenanceMode?: boolean;
}

/**
 * Update Email Settings Request
 */
export interface UpdateEmailSettingsRequest {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  fromEmail?: string;
  fromName?: string;
  secureConnection?: boolean;
}

/**
 * Update Security Settings Request
 */
export interface UpdateSecuritySettingsRequest {
  sessionTimeout?: number;
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireLowercase?: boolean;
  passwordRequireNumbers?: boolean;
  passwordRequireSpecialChars?: boolean;
  twoFactorAuthEnabled?: boolean;
  maxLoginAttempts?: number;
  lockoutDuration?: number;
}

/**
 * Update Integration Settings Request
 */
export interface UpdateIntegrationSettingsRequest {
  googleMapsApiKey?: string;
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
  elasticsearchHost?: string;
  elasticsearchPort?: number;
}

/**
 * Update Feature Flag Request
 */
export interface UpdateFeatureFlagRequest {
  enabled?: boolean;
  rolloutPercentage?: number;
}

/**
 * Update Theme Settings Request
 */
export interface UpdateThemeSettingsRequest {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  customCss?: string;
}

/**
 * Update Localization Settings Request
 */
export interface UpdateLocalizationSettingsRequest {
  defaultLanguage?: string;
  defaultTimezone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  currency?: string;
  currencySymbol?: string;
}

/**
 * Update Cache Settings Request
 */
export interface UpdateCacheSettingsRequest {
  defaultTTL?: number;
  userCacheTTL?: number;
  restaurantCacheTTL?: number;
  searchCacheTTL?: number;
  enableQueryCache?: boolean;
  enableResultCache?: boolean;
}

/**
 * Update Backup Settings Request
 */
export interface UpdateBackupSettingsRequest {
  autoBackupEnabled?: boolean;
  backupFrequency?: 'daily' | 'weekly' | 'monthly';
  backupRetentionDays?: number;
}

/**
 * Add Admin Request
 */
export interface AddAdminRequest {
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

/**
 * Audit Log Query
 */
export interface AuditLogQuery {
  adminId?: string;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Audit Log Response
 */
export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
