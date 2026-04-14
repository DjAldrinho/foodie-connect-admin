import { TestBed } from '@angular/core/testing';
import { ApiCacheService } from './api-cache.service';

/**
 * ApiCacheService Unit Tests
 *
 * Tests for API caching service with TTL support
 */
describe('ApiCacheService', () => {
  let service: ApiCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiCacheService],
    });

    service = TestBed.inject(ApiCacheService);
  });

  afterEach(() => {
    service.clear();
    jasmine.clock().uninstall();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  describe('set() and get() methods', () => {
    it('should set and get data', () => {
      service.set('key1', { value: 'test' });

      const data = service.get<{ value: string }>('key1');

      expect(data).toEqual({ value: 'test' });
    });

    it('should return null for non-existent key', () => {
      const data = service.get('non-existent');

      expect(data).toBeNull();
    });

    it('should store different data types', () => {
      service.set('string', 'test');
      service.set('number', 123);
      service.set('boolean', true);
      service.set('object', { foo: 'bar' });
      service.set('array', [1, 2, 3]);

      expect(service.get<string>('string')).toBe('test');
      expect(service.get<number>('number')).toBe(123);
      expect(service.get<boolean>('boolean')).toBe(true);
      expect(service.get<object>('object')).toEqual({ foo: 'bar' });
      expect(service.get<number[]>('array')).toEqual([1, 2, 3]);
    });

    it('should overwrite existing key', () => {
      service.set('key1', 'value1');
      service.set('key1', 'value2');

      expect(service.get('key1')).toBe('value2');
    });
  });

  describe('TTL (Time To Live)', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    it('should expire entries after TTL', () => {
      service.set('key1', 'value', 1000);

      expect(service.get('key1')).toBe('value');

      jasmine.clock().tick(1001);

      expect(service.get('key1')).toBeNull();
    });

    it('should not expire before TTL', () => {
      service.set('key1', 'value', 5000);

      jasmine.clock().tick(4000);

      expect(service.get('key1')).toBe('value');
    });

    it('should use default TTL when not specified', () => {
      service.set('key1', 'value');

      // Default TTL is 5 minutes (300000ms)
      jasmine.clock().tick(299999);

      expect(service.get('key1')).toBe('value');

      jasmine.clock().tick(2);

      expect(service.get('key1')).toBeNull();
    });

    it('should handle different TTLs for different keys', () => {
      service.set('short', 'value1', 1000);
      service.set('long', 'value2', 5000);

      jasmine.clock().tick(1001);

      expect(service.get('short')).toBeNull();
      expect(service.get('long')).toBe('value2');

      jasmine.clock().tick(4000);

      expect(service.get('long')).toBeNull();
    });
  });

  describe('invalidate() method', () => {
    beforeEach(() => {
      service.set('api/users', 'data1');
      service.set('api/posts', 'data2');
      service.set('api/comments', 'data3');
    });

    it('should invalidate exact key match', () => {
      service.invalidate('api/users');

      expect(service.get('api/users')).toBeNull();
      expect(service.get('api/posts')).toBe('data2');
    });

    it('should invalidate wildcard patterns', () => {
      service.invalidate('api/*');

      expect(service.get('api/users')).toBeNull();
      expect(service.get('api/posts')).toBeNull();
      expect(service.get('api/comments')).toBeNull();
    });

    it('should handle complex wildcard patterns', () => {
      service.set('users/1', 'data1');
      service.set('users/2', 'data2');
      service.set('posts/1', 'data3');

      service.invalidate('users/*');

      expect(service.get('users/1')).toBeNull();
      expect(service.get('users/2')).toBeNull();
      expect(service.get('posts/1')).toBe('data3');
    });

    it('should do nothing for non-existent pattern', () => {
      expect(() => {
        service.invalidate('non-existent');
      }).not.toThrow();
    });
  });

  describe('clear() method', () => {
    it('should clear all cache entries', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      service.set('key3', 'value3');

      expect(service.getStats().size).toBe(3);

      service.clear();

      expect(service.getStats().size).toBe(0);
      expect(service.get('key1')).toBeNull();
    });
  });

  describe('generateKey() method', () => {
    it('should generate key from endpoint only', () => {
      const key = service.generateKey({ endpoint: '/api/users' });

      expect(key).toBe('/api/users');
    });

    it('should generate key from endpoint and params', () => {
      const key = service.generateKey({
        endpoint: '/api/users',
        params: { page: 1, limit: 10 },
      });

      expect(key).toContain('/api/users?');
      expect(key).toContain('page=');
      expect(key).toContain('limit=');
    });

    it('should generate key from endpoint, params, and body', () => {
      const key = service.generateKey({
        endpoint: '/api/users',
        params: { page: 1 },
        body: { name: 'John' },
      });

      expect(key).toContain('/api/users?');
      expect(key).toContain('#');
    });

    it('should sort params for consistent keys', () => {
      const key1 = service.generateKey({
        endpoint: '/api/users',
        params: { b: 2, a: 1 },
      });

      const key2 = service.generateKey({
        endpoint: '/api/users',
        params: { a: 1, b: 2 },
      });

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different params', () => {
      const key1 = service.generateKey({
        endpoint: '/api/users',
        params: { page: 1 },
      });

      const key2 = service.generateKey({
        endpoint: '/api/users',
        params: { page: 2 },
      });

      expect(key1).not.toBe(key2);
    });
  });

  describe('has() method', () => {
    it('should return true for existing valid key', () => {
      service.set('key1', 'value');

      expect(service.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(service.has('non-existent')).toBe(false);
    });

    it('should return false for expired key', () => {
      jasmine.clock().install();
      service.set('key1', 'value', 1000);

      expect(service.has('key1')).toBe(true);

      jasmine.clock().tick(1001);

      expect(service.has('key1')).toBe(false);
    });
  });

  describe('getOrSet() method', () => {
    it('should return cached data if exists', async () => {
      service.set('key1', 'cached');

      const factory = jasmine.createSpy().and.resolveTo('fetched');

      const data = await service.getOrSet('key1', factory);

      expect(data).toBe('cached');
      expect(factory).not.toHaveBeenCalled();
    });

    it('should fetch and cache data if not exists', async () => {
      const factory = jasmine.createSpy().and.resolveTo('fetched');

      const data = await service.getOrSet('key1', factory);

      expect(data).toBe('fetched');
      expect(factory).toHaveBeenCalledTimes(1);
      expect(service.get('key1')).toBe('fetched');
    });

    it('should use custom TTL when provided', async () => {
      jasmine.clock().install();
      const factory = jasmine.createSpy().and.resolveTo('fetched');

      await service.getOrSet('key1', factory, 1000);

      jasmine.clock().tick(1001);

      const factory2 = jasmine.createSpy().and.resolveTo('fetched-again');
      const data = await service.getOrSet('key1', factory2);

      expect(factory2).toHaveBeenCalledTimes(1);
      expect(data).toBe('fetched-again');
    });
  });

  describe('invalidateMultiple() method', () => {
    beforeEach(() => {
      service.set('api/users', 'data1');
      service.set('api/posts', 'data2');
      service.set('api/comments', 'data3');
      service.set('users/1', 'data4');
    });

    it('should invalidate multiple patterns', () => {
      service.invalidateMultiple(['api/users', 'api/posts']);

      expect(service.get('api/users')).toBeNull();
      expect(service.get('api/posts')).toBeNull();
      expect(service.get('api/comments')).toBe('data3');
    });

    it('should handle wildcards in multiple patterns', () => {
      service.invalidateMultiple(['api/*', 'users/*']);

      expect(service.get('api/users')).toBeNull();
      expect(service.get('api/posts')).toBeNull();
      expect(service.get('users/1')).toBeNull();
    });
  });

  describe('getStats() method', () => {
    it('should return cache statistics', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      service.set('key3', 'value3');

      const stats = service.getStats();

      expect(stats.size).toBe(3);
      expect(stats.totalEntries).toBe(3);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
      expect(stats.keys).toContain('key3');
    });

    it('should return empty stats when cache is empty', () => {
      const stats = service.getStats();

      expect(stats.size).toBe(0);
      expect(stats.totalEntries).toBe(0);
      expect(stats.keys).toEqual([]);
    });

    it('should update stats after operations', () => {
      service.set('key1', 'value1');

      expect(service.getStats().size).toBe(1);

      service.invalidate('key1');

      expect(service.getStats().size).toBe(0);
    });
  });

  describe('cleanup interval', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    it('should cleanup expired entries periodically', () => {
      service.set('key1', 'value1', 1000);
      service.set('key2', 'value2', 5000);

      expect(service.getStats().size).toBe(2);

      // Fast forward 1 minute (cleanup interval)
      jasmine.clock().tick(60000);

      // key1 should be cleaned up, key2 should remain
      expect(service.getStats().size).toBe(1);
      expect(service.has('key1')).toBe(false);
      expect(service.has('key2')).toBe(true);
    });

    it('should run cleanup every minute', () => {
      const cleanupSpy = spyOn(service as any, 'cleanupExpiredEntries');

      jasmine.clock().tick(60000);
      expect(cleanupSpy).toHaveBeenCalledTimes(1);

      jasmine.clock().tick(60000);
      expect(cleanupSpy).toHaveBeenCalledTimes(2);

      jasmine.clock().tick(60000);
      expect(cleanupSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('edge cases', () => {
    it('should handle null and undefined values', () => {
      service.set('null-key', null);
      service.set('undefined-key', undefined);

      expect(service.get('null-key')).toBeNull();
      expect(service.get('undefined-key')).toBeUndefined();
    });

    it('should handle empty objects and arrays', () => {
      service.set('empty-obj', {});
      service.set('empty-array', []);

      expect(service.get('empty-obj')).toEqual({});
      expect(service.get('empty-array')).toEqual([]);
    });

    it('should handle special characters in keys', () => {
      service.set('key/with/slashes', 'value1');
      service.set('key?with=query&params', 'value2');
      service.set('key#with#hash', 'value3');

      expect(service.get('key/with/slashes')).toBe('value1');
      expect(service.get('key?with=query&params')).toBe('value2');
      expect(service.get('key#with#hash')).toBe('value3');
    });

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(1000);
      service.set(longKey, 'value');

      expect(service.get(longKey)).toBe('value');
    });

    it('should handle concurrent set operations', () => {
      for (let i = 0; i < 100; i++) {
        service.set(`key${i}`, `value${i}`);
      }

      expect(service.getStats().size).toBe(100);

      for (let i = 0; i < 100; i++) {
        expect(service.get(`key${i}`)).toBe(`value${i}`);
      }
    });
  });

  describe('type safety', () => {
    it('should preserve type information', () => {
      interface User {
        id: string;
        name: string;
      }

      const user: User = { id: '1', name: 'John' };
      service.set<User>('user', user);

      const retrievedUser = service.get<User>('user');

      expect(retrievedUser?.id).toBe('1');
      expect(retrievedUser?.name).toBe('John');
    });
  });
});
