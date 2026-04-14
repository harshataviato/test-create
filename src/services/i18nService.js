/**
 * @file services/i18nService.js
 * @description Service for managing internationalization messages.
 * This module configures and exports the i18n instance.
 */

const i18n = require('i18n');
const path = require('path');

/**
 * @function setupI18n
 * @description Configures the i18n-node module.
 * @returns {object} The configured i18n instance.
 */
const setupI18n = () => {
  i18n.configure({
    locales: ['en', 'de', 'es', 'fa', 'ko', 'pt', 'ru', 'tr'], // Supported locales
    defaultLocale: 'en', // Default locale if not specified
    directory: path.join(__dirname, '../locales'), // Directory where locale files are stored
    queryParameter: 'lang', // URL query parameter to change locale (e.g., ?lang=de)
    cookie: 'petclinic_locale', // Cookie name to store user's selected locale
    syncFiles: true, // Sync locale files to prevent missing keys on startup
    objectNotation: true, // Enable object notation in locale files
    api: {
      '__': 'i18n.__', // Custom alias for __()
      '__n': 'i18n.__n' // Custom alias for __n()
    }
  });
  return i18n;
};

module.exports = setupI18n();
