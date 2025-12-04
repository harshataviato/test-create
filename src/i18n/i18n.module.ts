import { DynamicModule, Module } from '@nestjs/common';
import { AcceptLanguageResolver, HeaderResolver, I18nModule as NestI18nModule, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';

/**
 * @module I18n
 * @description
 * Configures and provides internationalization (i18n) support for the application.
 * This module uses `nestjs-i18n` to handle loading language-specific messages
 * and resolving the user's preferred locale.
 *
 * It loads translation files (JSON format) from `src/i18n/messages` and
 * prioritizes locale resolution from query parameters (`lang`), then headers (`Accept-Language`).
 */
@Module({})
export class I18nModule {
  /**
   * Registers the `nestjs-i18n` module with the application.
   *
   * @returns {DynamicModule} The configured `NestI18nModule`.
   */
  static register(): DynamicModule {
    return NestI18nModule.forRoot({
      fallbackLanguage: 'en', // Default language if no specific locale is found
      loaderOptions: {
        path: join(__dirname, 'messages'), // Path to the directory containing translation files
        watch: true, // Watch for changes in translation files during development
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] }, // Resolve locale from 'lang' query parameter (e.g., ?lang=es)
        AcceptLanguageResolver, // Resolve locale from 'Accept-Language' header
        new HeaderResolver(['x-custom-lang']), // Custom header for locale resolution if needed
      ],
      // For more resolver options see: https://docs.nestjs.com/recipes/i18n#language-resolvers
    });
  }
}
