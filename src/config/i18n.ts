/**
 * @module config/i18n
 * @description Configuration for the i18n-node library.
 * Defines the setup for internationalization, including locale directories,
 * default locale, and supported languages.
 */

import path from 'path';
import i18n from 'i18n';

/**
 * @constant {i18n.ConfigurationOptions} i18nConfig
 * @description Configuration object for the i18n-node library.
 * This setup allows the application to support multiple languages by
 * loading translation files from the 'locales' directory.
 */
export const i18nConfig: i18n.ConfigurationOptions = {
  // Path to the directory where translation files are stored
  directory: path.join(__dirname, '../../locales'),
  // Fallback locale if a specific translation is not found
  defaultLocale: 'en',
  // List of supported locales (languages)
  locales: ['en', 'de', 'es', 'fa', 'ko', 'pt', 'ru', 'tr'],
  // How to detect the locale (e.g., 'query' for ?lang=en, 'cookie' for cookie value)
  // For this app, we primarily use a query parameter 'lang' as seen in WebConfiguration.
  // In Express, a middleware could set req.locale based on query/cookie.
  queryParameter: 'lang',
  // Sets the object on which translation functions are available.
  // For Express, this defaults to 'res', making functions like res.__() available.
  // We'll also expose it to res.locals for template usage.
  cookie: 'lang', // Optional: Persist locale in a cookie
  header: 'accept-language', // Optional: Detect locale from Accept-Language header
  autoReload: true, // Automatically reload locale files when changed (for development)
  updateFiles: false, // Do not update translation files (add missing keys)
  syncFiles: true, // Sync locale files automatically (adds missing keys with default value from defaultLocale)
  // Register the helper function __ to res.locals for EJS templates
  // This is typically handled by a custom middleware after i18n.init
};

// You can initialize i18n here if you prefer a global instance,
// but for Express middleware, i18n.init() is typically called per request.
// i18n.configure(i18nConfig);
