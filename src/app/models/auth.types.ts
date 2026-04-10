/**
 * Authentication and authorization types
 */

import type { Timestamped } from './common.types';

/**
 * User roles
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/**
 * User status
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

/**
 * User permissions
 */
export enum Permission {
  // User management
  READ_USERS = 'read:users',
  WRITE_USERS = 'write:users',
  DELETE_USERS = 'delete:users',

  // Restaurant management
  READ_RESTAURANTS = 'read:restaurants',
  WRITE_RESTAURANTS = 'write:restaurants',
  DELETE_RESTAURANTS = 'delete:restaurants',
  VERIFY_RESTAURANTS = 'verify:restaurants',

  // Moderation
  READ_REPORTS = 'read:reports',
  RESOLVE_REPORTS = 'resolve:reports',
  MODERATE_REVIEWS = 'moderate:reviews',
  MODERATE_PHOTOS = 'moderate:photos',

  // Analytics
  READ_ANALYTICS = 'read:analytics',

  // Settings
  MANAGE_SETTINGS = 'manage:settings',
}

/**
 * Role permissions mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [],
  [UserRole.ADMIN]: [
    Permission.READ_USERS,
    Permission.READ_RESTAURANTS,
    Permission.READ_REPORTS,
    Permission.READ_ANALYTICS,
  ],
  [UserRole.SUPER_ADMIN]: [
    Permission.READ_USERS,
    Permission.WRITE_USERS,
    Permission.DELETE_USERS,
    Permission.READ_RESTAURANTS,
    Permission.WRITE_RESTAURANTS,
    Permission.DELETE_RESTAURANTS,
    Permission.VERIFY_RESTAURANTS,
    Permission.READ_REPORTS,
    Permission.RESOLVE_REPORTS,
    Permission.MODERATE_REVIEWS,
    Permission.MODERATE_PHOTOS,
    Permission.READ_ANALYTICS,
    Permission.MANAGE_SETTINGS,
  ],
};

/**
 * User entity
 */
export interface User extends Timestamped {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permission[];
  lastLogin?: string;
  emailVerified: boolean;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Token payload
 */
export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
