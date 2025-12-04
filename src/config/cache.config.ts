import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { DynamicModule } from '@nestjs/common';
import * as JCacheManager from 'cache-manager';
import * as JCacheMemoryStore from 'cache-manager-memory-store';

/**
 * @module Config
 * @description
 * Configuration for the application's caching mechanism.
 * This module integrates `@nestjs/cache-manager` to provide caching capabilities,
 * similar to Spring's JCache support.
 *
 * It uses an in-memory store for simplicity, suitable for single-instance deployments
 * or as a basic cache. For distributed caching, a different store (e.g., Redis)
 * would be configured.
 */
export class CacheConfig {
  /**
   * Configures and registers the CacheModule.
   *
   * @returns {DynamicModule} The configured NestJS CacheModule.
   */
  static register(): DynamicModule {
    // Define cache options, including an in-memory store
    const cacheOptions: CacheModuleOptions = {
      store: JCacheMemoryStore, // Use the in-memory store
      ttl: 3600, // Time-to-live for cache entries in seconds (1 hour)
      max: 100, // Maximum number of items in cache
    };

    return CacheModule.register(cacheOptions);
  }
}
