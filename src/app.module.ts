import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HandlebarsAdapter, MailerModule } from '@nestjs-modules/mailer'; // Not used Mailer, just keeping for example of other modules if needed
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OwnersModule } from './owners/owners.module';
import { VetsModule } from './vets/vets.module';
import { SystemModule } from './system/system.module';
import { AppDataSource } from './config/typeorm.config';
import { CacheConfig } from './config/cache.config';
import { I18nModule } from './i18n/i18n.module';
import { WebConfigurationModule } from './config/web.config';

/**
 * @module AppModule
 * @description
 * The root module of the PetClinic TypeScript application.
 * It integrates all other feature modules, configures the database connection
 * using TypeORM, sets up caching, and internationalization (i18n).
 * This module acts as the central orchestrator, similar to `PetClinicApplication` in Java.
 */
@Module({
  imports: [
    // TypeORM configuration for database connection
    TypeOrmModule.forRoot(AppDataSource.options),

    // Cache module configuration for application-wide caching
    CacheConfig.register(),

    // Internationalization module setup
    I18nModule.register(),

    // Web configuration module for middleware setup
    WebConfigurationModule,

    // Feature modules of the application
    OwnersModule,
    VetsModule,
    SystemModule,
  ],
  controllers: [AppController], // Root application controller (if any)
  providers: [AppService], // Root application service (if any)
})
export class AppModule {}
