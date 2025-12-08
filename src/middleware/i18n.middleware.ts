/**
 * @module middleware/i18n.middleware
 * @description
 * Configures and integrates i18next for internationalization (i18n) in the Express application.
 * This middleware initializes i18next, loads translation files, and makes translation
 * functions available on the request object.
 */

import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import path from 'path';

// Initialize i18next with file system backend
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, '../i18n/{{lng}}.json'), // Path to translation files
    },
    fallbackLng: 'en', // Default language if detection fails
    preload: ['en', 'de', 'es', 'fa', 'ko', 'pt', 'ru', 'tr'], // Preload all available languages
    detection: {
      order: ['querystring', 'cookie', 'header'], // Order of language detection
      caches: ['cookie'], // Store detected language in cookie
      lookupQuerystring: 'lang', // URL query parameter for language (e.g., ?lang=de)
      lookupCookie: 'lang', // Cookie name for language
      ignoreCase: true,
      cookieSecure: process.env.NODE_ENV === 'production',
    },
    // Debug mode logs more information to the console, useful during development
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // Not needed for Express, as EJS escapes by default
    },
  });

// Export the i18next middleware for use in the Express app
export default middleware.handle(i18next);
