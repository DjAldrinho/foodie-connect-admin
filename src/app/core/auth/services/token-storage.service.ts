import { inject } from '@angular/core';
import { Router } from '@angular/router';

import type { TokenPayload } from '../../../models/auth.types';

/**
 * Service for managing JWT tokens in localStorage
 * SSR-safe: checks for localStorage availability before accessing
 */
export const TokenStorageService = () => {
  const router = inject(Router);

  const ACCESS_TOKEN_KEY = 'access_token';
  const REFRESH_TOKEN_KEY = 'refresh_token';
  const USER_KEY = 'user_data';

  /**
   * Check if localStorage is available (SSR-safe)
   */
  const isLocalStorageAvailable = (): boolean => {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  };

  /**
   * Get access token
   */
  const getAccessToken = (): string | null => {
    if (!isLocalStorageAvailable()) return null;

    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  };

  /**
   * Set access token
   */
  const setAccessToken = (token: string): void => {
    if (!isLocalStorageAvailable()) return;

    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving access token:', error);
    }
  };

  /**
   * Get refresh token
   */
  const getRefreshToken = (): string | null => {
    if (!isLocalStorageAvailable()) return null;

    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  };

  /**
   * Set refresh token
   */
  const setRefreshToken = (token: string): void => {
    if (!isLocalStorageAvailable()) return;

    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving refresh token:', error);
    }
  };

  /**
   * Clear all tokens
   */
  const clearTokens = (): void => {
    if (!isLocalStorageAvailable()) return;

    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  };

  /**
   * Check if token is expired
   */
  const isTokenExpired = (token?: string): boolean => {
    const accessToken = token || getAccessToken();
    if (!accessToken) return true;

    try {
      const payload = parseToken(accessToken);
      if (!payload) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  };

  /**
   * Parse JWT token
   */
  const parseToken = (token: string): TokenPayload | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload) as TokenPayload;
    } catch {
      return null;
    }
  };

  /**
   * Get token payload
   */
  const getTokenPayload = (): TokenPayload | null => {
    const token = getAccessToken();
    if (!token) return null;

    return parseToken(token);
  };

  /**
   * Get time until token expiry (in seconds)
   */
  const getTimeUntilExpiry = (): number => {
    const payload = getTokenPayload();
    if (!payload) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - currentTime);
  };

  /**
   * Save user data
   */
  const setUserData = (user: unknown): void => {
    if (!isLocalStorageAvailable()) return;

    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  /**
   * Get user data
   */
  const getUserData = <T = unknown>(): T | null => {
    if (!isLocalStorageAvailable()) return null;

    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  };

  return {
    getAccessToken,
    setAccessToken,
    getRefreshToken,
    setRefreshToken,
    clearTokens,
    isTokenExpired,
    getTokenPayload,
    getTimeUntilExpiry,
    setUserData,
    getUserData,
  };
};
