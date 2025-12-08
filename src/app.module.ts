import { Module, CacheModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { I18nModule, I18nService, AcceptLanguageResolver, CookieResolver, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import * as path from 'path';

// Import application configuration functions
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import i18nConfig from './config/i18n.config';

// Import feature modules
import { OwnerModule } from './modules/owner/owner.module';
import { VetModule } from './modules/vet/vet.module';
import { SystemModule } from './modules/system/system.module';

// Import common middleware
import { SessionMiddleware } from './common/middleware/session.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Root module of the PetClinic application.
 * Configures global settings, database connection, static assets, and internationalization.
 */
@Module({
  imports: [
    // Load configuration from .env files
    ConfigModule.forRoot({
      isGlobal: true, // Make configuration available globally
      load: [appConfig, databaseConfig, i18nConfig], // Load custom configuration files
      envFilePath: ['.env'], // Specify the .env file path
    }),
    // TypeORM database configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database'), // Use the 'database' config object
    }),
    // Serve static files from the 'public' directory
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Path to static assets
      serveRoot: '/resources', // URL prefix for static assets
    }),
    // Configure caching for the application
    CacheModule.register({
      isGlobal: true, // Make cache module available globally
      ttl: 5 * 60 * 1000, // Cache TTL (time-to-live) of 5 minutes
      max: 100, // Maximum number of items in cache
    }),
    // Internationalization (i18n) module configuration
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get<string>('i18n.fallbackLanguage'), // Fallback language from config
        loaderOptions: {
          path: path.join(__dirname, '/i18n/'), // Path to translation files
          watch: true, // Watch for changes in translation files during development
        },
        viewEngine: 'ejs', // Specify EJS as the view engine for i18n templates
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] }, // Resolve language from 'lang' query parameter (e.g., ?lang=es)
        new CookieResolver(['lang']), // Resolve language from 'lang' cookie
        AcceptLanguageResolver, // Resolve language from 'Accept-Language' header
        new HeaderResolver(['x-custom-lang']), // Resolve language from 'x-custom-lang' header
      ],
      inject: [ConfigService],
    }),
    // Feature modules
    OwnerModule,
    VetModule,
    SystemModule,
  ],
  providers: [AppService],
  controllers: [AppController] // Add the root AppController here
})
export class AppModule {
  /**
   * Configures middleware for the application.
   * @param consumer MiddlewareConsumer instance for applying middleware.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware) // Apply the custom SessionMiddleware
      .forRoutes({ path: '*', method: RequestMethod.ALL }); // Apply to all routes and all HTTP methods
  }
}
