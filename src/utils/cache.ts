/**
 * @module utils/cache
 * @description Provides a simple in-memory caching service using `node-cache`.
 *              This acts as an equivalent to Spring's `@Cacheable` and `CacheConfiguration`.
 *              Configurable via `CACHE_TYPE` environment variable.
 */

import NodeCache from 'node-cache';

/**
 * @interface CacheServiceOptions
 * @description Options for the CacheService.
 * @property {'memory' | 'none'} type - The type of cache to use. 'memory' uses NodeCache, 'none' disables caching.
 */
interface CacheServiceOptions {
  type: 'memory' | 'none';
  stdTTL: number; // default time to live in seconds
  checkperiod: number; // interval in seconds to check for expired keys
}

/**
 * @class CacheService
 * @description A wrapper around `node-cache` providing caching functionality,
 *              or a no-op implementation if caching is disabled.
 */
export class CacheService {
  private cache: NodeCache | null;
  private cacheType: 'memory' | 'none';

  /**
   * @constructor
   * @param {Partial<CacheServiceOptions>} options - Optional configuration for the cache.
   */
  constructor(options?: Partial<CacheServiceOptions>) {
    this.cacheType = (process.env.CACHE_TYPE as 'memory' | 'none') || options?.type || 'memory';

    if (this.cacheType === 'memory') {
      const defaultOptions: NodeCache.Options = {
        stdTTL: options?.stdTTL || 3600, // Default TTL of 1 hour
        checkperiod: options?.checkperiod || 600, // Check for expired keys every 10 minutes
        useClones: false, // Store references, not copies, for better performance with objects
      };
      this.cache = new NodeCache(defaultOptions);
      console.log('CacheService initialized with in-memory caching.');
    } else {
      this.cache = null;
      console.log('CacheService initialized with no caching.');
    }
  }

  /**
   * @method get
   * @description Retrieves a value from the cache.
   * @template T - The type of the cached value.
   * @param {string} key - The key of the item to retrieve.
   * @returns {T | undefined} The cached value, or `undefined` if not found or caching is disabled.
   */
  get<T>(key: string): T | undefined {
    if (this.cache) {
      return this.cache.get<T>(key);
    }
    return undefined;
  }

  /**
   * @method set
   * @description Stores a value in the cache.
   * @template T - The type of the value to store.
   * @param {string} key - The key under which to store the value.
   * @param {T} value - The value to store.
   * @param {number} [ttl] - Optional time-to-live for this specific item (in seconds).
   * @returns {boolean} `true` if the value was set, `false` otherwise (e.g., caching disabled).
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    if (this.cache) {
      return this.cache.set(key, value, ttl);
    }
    return false;
  }

  /**
   * @method del
   * @description Deletes a key from the cache.
   * @param {string | string[]} key - The key or array of keys to delete.
   * @returns {number} The number of deleted keys.
   */
  del(key: string | string[]): number {
    if (this.cache) {
      return this.cache.del(key);
    }
    return 0;
  }

  /**
   * @method flushAll
   * @description Clears the entire cache.
   */
  flushAll(): void {
    if (this.cache) {
      this.cache.flushAll();
      console.log('Cache flushed.');
    }
  }

  /**
   * @method close
   * @description Closes the cache instance.
   */
  close(): void {
    if (this.cache) {
      this.cache.close();
      this.cache = null;
      console.log('Cache closed.');
    }
  }
}
