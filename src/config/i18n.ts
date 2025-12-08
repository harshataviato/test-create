/**
 * @module config/i18n
 * @description Internationalization (i18n) configuration for the application.
 *              Uses `i18next` with `i18next-fs-backend` for loading translation files.
 */

import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';

/**
 * @constant i18nOptions
 * @description Configuration object for i18next.
 * @property {object} backend - Backend options for i18next-fs-backend.
 * @property {string} backend.loadPath - Path to load translation files.
 * @property {string[]} fallbackLng - Fallback language if a translation is not found.
 * @property {string} defaultNS - Default namespace for translations.
 * @property {boolean} preload - Preload all available languages.
 * @property {boolean} saveMissing - Whether to save missing keys (useful for development).
 * @property {boolean} debug - Enable debug logging for i18next.
 * @property {string[]} supportedLngs - Array of supported languages.
 */
const i18nOptions = {
  backend: {
    loadPath: path.join(__dirname, '../../public/locales/{{lng}}/{{ns}}.json'),
  },
  fallbackLng: 'en', // Fallback language
  defaultNS: 'messages', // Default namespace (corresponds to messages.properties)
  preload: ['en', 'de', 'es', 'fa', 'ko', 'pt', 'ru', 'tr'], // Preload all supported languages
  saveMissing: false, // Set to true to write missing keys to translation files in development
  debug: false, // Set to true to enable i18next debug logging
  supportedLngs: ['en', 'de', 'es', 'fa', 'ko', 'pt', 'ru', 'tr'], // Explicitly list supported languages
  ns: ['messages'], // Define namespaces (only 'messages' for now, matching the properties file names)
  // Options for passing language to the backend and client
  detection: {
    order: ['querystring', 'cookie', 'header'],
    caches: ['cookie'],
    lookupQuerystring: 'lang', // URL parameter to change language (e.g., ?lang=de)
    lookupCookie: 'i18next',
    cookieSecure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    cookieSameSite: 'strict', // Strict same-site policy for cookies
  },
};

/**
 * @function initializeI18n
 * @description Initializes and returns the i18next instance.
 * @returns {i18n.i18n} The initialized i18next instance.
 */
export function initializeI18n(): i18n.i18n {
  i18n
    .use(Backend) // Use the file system backend to load translations
    .init(i18nOptions); // Initialize i18next with options

  return i18n;
}
