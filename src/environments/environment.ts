/**
 * Development environment configuration
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000',
  appName: 'Foodie Connect Admin',
  version: '1.0.0',

  // Feature flags
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableReports: true,
    enableExport: true,
    enableBulkActions: true,
    enableAdvancedFilters: true,
  },

  // App settings
  settings: {
    defaultPageSize: 10,
    maxPageSize: 100,
    sessionTimeoutMinutes: 30,
    tokenRefreshBeforeMinutes: 1,
    maxFileSize: 5242880, // 5MB in bytes
    allowedFileTypes: ['.jpg', '.jpeg', '.png', '.webp'],
  },

  // Cache settings
  cache: {
    defaultTTL: 300000, // 5 minutes in milliseconds
    metricsTTL: 30000, // 30 seconds
    shortTTL: 60000, // 1 minute
  },
};
