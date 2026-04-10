import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';

/**
 * Cached entry interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Cache key options
 */
interface CacheKeyOptions {
  endpoint: string;
  params?: Record<string, any>;
  body?: Record<string, any>;
}

/**
 * API Cache service
 * Caches API responses with TTL (Time To Live) support
 * Reduces unnecessary API calls and improves performance
 */
@Injectable({
  providedIn: 'root',
})
export class ApiCacheService {
  // Private cache storage
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTTL = environment.cache.defaultTTL; // 5 minutes

  constructor() {
    // Setup periodic cleanup of expired entries
    this.setupCleanupInterval();
  }

  /**
   * Get cached data by key
   * @param key Cache key
   * @returns Cached data or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    };

    this.cache.set(key, entry as CacheEntry<unknown>);
  }

  /**
   * Invalidate cache entries matching pattern
   * @param pattern Cache key pattern (supports wildcards)
   */
  invalidate(pattern: string): void {
    const keys = Array.from(this.cache.keys());

    if (pattern.includes('*')) {
      // Wildcard pattern matching
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      keys
        .filter((key) => regex.test(key))
        .forEach((key) => this.cache.delete(key));
    } else {
      // Exact match
      this.cache.delete(pattern);
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Generate cache key from request options
   * @param options Cache key options
   * @returns Generated cache key
   */
  generateKey(options: CacheKeyOptions): string {
    const { endpoint, params = {}, body = {} } = options;

    // Build key string
    let key = endpoint;

    // Add params if present
    if (Object.keys(params).length > 0) {
      const sortedParams = Object.keys(params)
        .sort()
        .map((k) => `${k}=${JSON.stringify(params[k])}`)
        .join('&');
      key += `?${sortedParams}`;
    }

    // Add body hash if present
    if (Object.keys(body).length > 0) {
      const bodyHash = this.hashObject(body);
      key += `#${bodyHash}`;
    }

    return key;
  }

  /**
   * Check if cache entry is expired
   * @param entry Cache entry
   * @returns true if expired
   */
  private isExpired(entry: CacheEntry<unknown>): boolean {
    const now = Date.now();
    const expiry = entry.timestamp + entry.ttl;
    return now > expiry;
  }

  /**
   * Generate simple hash from object
   * @param obj Object to hash
   * @returns Hash string
   */
  private hashObject(obj: Record<string, any>): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Setup periodic cleanup of expired entries
   * Runs every minute
   */
  private setupCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000); // Every minute
  }

  /**
   * Remove all expired entries from cache
   */
  private cleanupExpiredEntries(): void {
    const keys = Array.from(this.cache.keys());

    keys.forEach((key) => {
      const entry = this.cache.get(key);
      if (entry && this.isExpired(entry)) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Get cache statistics
   * @returns Cache stats
   */
  getStats(): {
    size: number;
    keys: string[];
    totalEntries: number;
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalEntries: this.cache.size,
    };
  }

  /**
   * Check if key exists and is valid
   * @param key Cache key
   * @returns true if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  /**
   * Get or set pattern-based cache
   * If data exists in cache, return it; otherwise, fetch and cache it
   * @param key Cache key
   * @param factory Function to fetch data if not cached
   * @param ttl Optional TTL
   * @returns Cached or fetched data
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Invalidate multiple patterns
   * @param patterns Array of cache key patterns
   */
  invalidateMultiple(patterns: string[]): void {
    patterns.forEach((pattern) => this.invalidate(pattern));
  }
}
