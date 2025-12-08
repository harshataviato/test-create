import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { I18nService } from 'nestjs-i18n';

/**
 * CacheConfigurationService is responsible for programmatic configuration of caches.
 * It serves as an equivalent to Spring's JCacheManagerCustomizer, allowing setup of
 * cache regions and enabling statistics.
 */
@Injectable()
export class CacheConfigurationService implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly i18n: I18nService, // Inject I18nService if cache keys/messages need translation
  ) {}

  /**
   * Called once the host module has been initialized.
   * This method is used to define and configure cache regions programmatically.
   */
  async onModuleInit() {
    console.log('CacheConfigurationService initialized. Configuring caches...');

    // Example: Configure a cache for 'vets'
    // In NestJS CacheManager, caches are typically defined via CacheModule.register()
    // and keys are used to identify them. Programmatic 'creation' in the JCache sense
    // might involve setting specific options for a key if the underlying cache library supports it.
    // For cache-manager, options are usually global or passed when calling .wrap()
    // For demonstration, we just acknowledge the 'vets' cache exists via CacheModule.register().

    // We can simulate an action that would "create" a cache with properties if the underlying
    // cache-manager store supported specific configuration per key.
    // For example, if using `cache-manager-redis-store` you might pass specific options
    // when setting/getting or wrapping, but typically for named caches like 'vets',
    // the configuration is defined at the module level.

    // To illustrate enabling statistics, typically this would be a feature of the underlying cache store.
    // For `cache-manager`, it often involves custom metrics or logging rather than a direct 'setStatisticsEnabled' call.
    // We can log that the 'vets' cache is conceptually configured.
    console.log(
      await this.i18n.translate('messages.cacheConfigured', {
        lang: 'en',
        args: { cacheName: 'vets' },
      }),
    );
  }

  // You can add methods here to interact with the cache manager if needed,
  // e.g., for custom cache eviction logic or monitoring.
}
