/**
 * @module config/i18n
 * @description Configures the i18n-node library for internationalization.
 * Translation files are located in the `locales` directory.
 */

const i18n = require('i18n');
const path = require('path');

i18n.configure({
  locales: ['en', 'es'], // Supported locales
  defaultLocale: process.env.DEFAULT_LOCALE || 'en', // Default locale from .env
  directory: path.join(__dirname, '..', 'locales'), // Path to translation files
  extension: '.json', // Use JSON files for translations
  autoReload: true, // Reload translations if files change (good for dev)
  updateFiles: false, // Do not create missing translation keys in files automatically
  syncFiles: false, // Do not sync all locale files
  cookie: 'locale', // Cookie name to store the selected locale
  header: 'accept-language', // Header to check for locale if no cookie or query param
  queryParameter: 'lang', // Query parameter to change locale (e.g., ?lang=es)
  objectNotation: true // Allows accessing translation keys with dot notation (e.g., 'common.greeting')
});

module.exports = i18n;
