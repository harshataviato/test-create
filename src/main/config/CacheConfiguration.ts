/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file is a conceptual TypeScript adaptation of CacheConfiguration.java.
// The original Java class configures JCache for Spring Boot applications, enabling
// caching for specific services (like `vets`) and exposing statistics via JMX.
//
// This concept does not have a direct 1:1 functional equivalent in a standard Node.js/TypeScript
// environment, as Node.js uses different caching libraries and monitoring tools.
//
// In a Node.js/TypeScript application, caching would typically be implemented using:
// - **In-memory caches**: Libraries like `node-cache`, `lru-cache`, or a simple `Map` for local caching.
// - **External caches**: Distributed caches like Redis or Memcached, accessed via their respective client libraries.
// - **Aspect-Oriented Programming (AOP)**: If a decorator-based caching like `@Cacheable` is desired,
//   libraries like `reflect-metadata` can be used to implement custom decorators for caching aspects.
// - **Monitoring**: Tools like Prometheus/Grafana or custom metrics endpoints would replace JMX.
//
// **Conceptual TypeScript Implementation (using `node-cache` for illustration):**

import NodeCache from 'node-cache'; // npm install node-cache @types/node-cache

// Define a conceptual cache manager customizer if multiple caches are needed.
interface CacheManagerCustomizer {
  customize(cacheManager: NodeCacheManager): void;
}

// A simple wrapper around node-cache to mimic JCache-like behavior and stats
class NodeCacheWrapper<K, V> {
  private cache: NodeCache;
  private name: string;
  private _hits: number = 0;
  private _misses: number = 0;

  constructor(name: string, options?: NodeCache.Options) {
    this.name = name;
    this.cache = new NodeCache(options);
    console.log(`[Cache] Initialized cache "${name}" with options:`, options);
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key as any);
    if (value !== undefined) {
      this._hits++;
      return value as V;
    }
    this._misses++;
    return undefined;
  }

  set(key: K, value: V, ttl?: number): boolean {
    return this.cache.set(key as any, value, ttl);
  }

  del(key: K): number {
    return this.cache.del(key as any);
  }

  flush(): void {
    this.cache.flushAll();
    this._hits = 0;
    this._misses = 0;
  }

  getStats(): { hits: number, misses: number, keys: number } {
    return {
      hits: this._hits,
      misses: this._misses,
      keys: this.cache.keys().length,
    };
  }
}

// A conceptual CacheManager
export class NodeCacheManager {
  private caches = new Map<string, NodeCacheWrapper<any, any>>();

  createCache<K, V>(name: string, options?: NodeCache.Options): NodeCacheWrapper<K, V> {
    if (this.caches.has(name)) {
      console.warn(`[CacheManager] Cache "${name}" already exists, returning existing instance.`);
      return this.caches.get(name) as NodeCacheWrapper<K, V>;
    }
    const newCache = new NodeCacheWrapper<K, V>(name, options);
    this.caches.set(name, newCache);
    return newCache;
  }

  getCache<K, V>(name: string): NodeCacheWrapper<K, V> | undefined {
    return this.caches.get(name);
  }

  // Mimics `JCacheManagerCustomizer.customize` concept
  public applyCustomizations(customizers: CacheManagerCustomizer[]): void {
    customizers.forEach(customizer => customizer.customize(this));
  }

  // For monitoring/JMX equivalent:
  public logAllCacheStats(): void {
    console.log('\n--- Cache Statistics ---');
    this.caches.forEach((cache, name) => {
      const stats = cache.getStats();
      console.log(`Cache: ${name} | Hits: ${stats.hits} | Misses: ${stats.misses} | Keys: ${stats.keys}`);
    });
    console.log('------------------------\n');
  }
}

/**
 * Conceptual Cache Configuration.
 * Mimics `org.springframework.samples.petclinic.system.CacheConfiguration`.
 */
export class PetclinicCacheConfiguration {
  private cacheManager: NodeCacheManager;

  constructor() {
    this.cacheManager = new NodeCacheManager();
    this.applyCustomizations();
  }

  /**
   * Mimics `@JCacheManagerCustomizer petclinicCacheConfigurationCustomizer()` bean.
   */
  private petclinicCacheConfigurationCustomizer(): CacheManagerCustomizer {
    return {
      customize: (cm: NodeCacheManager) => {
        cm.createCache<string, any>('vets', this.cacheConfiguration());
      },
    };
  }

  /**
   * Mimics `javax.cache.configuration.Configuration<Object, Object> cacheConfiguration()`.
   */
  private cacheConfiguration(): NodeCache.Options {
    // Mimics `.setStatisticsEnabled(true)`
    // node-cache has statistics enabled by default. We can configure TTL, max keys, etc.
    return {
      stdTTL: 60 * 60, // 1 hour TTL by default for vets cache
      checkperiod: 120, // Check for expired keys every 120 seconds
      useClones: false, // Return references, not clones (better performance)
    };
  }

  /**
   * Applies all customizer beans to the cache manager.
   */
  private applyCustomizations(): void {
    this.cacheManager.applyCustomizations([this.petclinicCacheConfigurationCustomizer()]);
  }

  /**
   * Get the configured cache manager instance.
   */
  public getCacheManager(): NodeCacheManager {
    return this.cacheManager;
  }
}

// Export a singleton instance of the cache configuration and manager.
export const petclinicCacheConfig = new PetclinicCacheConfiguration();
export const cacheManager = petclinicCacheConfig.getCacheManager();

// How `@Cacheable("vets")` would be conceptually implemented via a decorator in TS:
/*
// decorators/cacheable.ts
import { cacheManager } from '../config/CacheConfiguration';

export function Cacheable(cacheName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = cacheManager.getCache(cacheName);
      if (!cache) {
        console.warn(`[Cacheable] Cache "${cacheName}" not configured. Executing method directly.`);
        return originalMethod.apply(this, args);
      }

      // Create a cache key from method name and arguments
      const cacheKey = `${propertyKey}-${JSON.stringify(args)}`;
      let cachedResult = cache.get(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, result); // Cache the result
      return result;
    };

    return descriptor;
  };
}
*/
