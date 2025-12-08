import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrashController } from './crash.controller';
import { WelcomeController } from './welcome.controller';
import { I18nService } from 'nestjs-i18n';
import { CacheConfigurationService } from './cache.configuration.service';


/**
 * SystemModule handles general application system functionalities.
 * This includes error demonstration and the welcome page.
 * It also holds the I18nService as a provider, as it's used globally.
 */
@Module({
  imports: [], // No specific TypeORM entities or other modules needed directly here
  controllers: [CrashController, WelcomeController], // Controllers for system-level routes
  providers: [
    I18nService, // I18nService for internationalization (used in filters/controllers)
    CacheConfigurationService // Service to configure cache (JCache equivalent setup)
  ],
  exports: [I18nService, CacheConfigurationService], // Export I18nService if needed by other modules
})
export class SystemModule {}
