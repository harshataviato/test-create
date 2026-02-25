/**
 * @fileoverview Internationalization (i18n) configuration for the Express application.
 * This file sets up the 'i18n-node' library to handle multi-language support.
 */

const i18n = require('i18n'); // Import the i18n library
const path = require('path'); // Import path module for directory resolution

// Configure the i18n library
i18n.configure({
    locales: ['en', 'de', 'es', 'fa', 'ko', 'pt', 'ru', 'tr'], // Supported locales (languages)
    directory: path.join(__dirname, '../locales'), // Path to the directory containing translation files
    defaultLocale: 'en', // Default locale if no specific locale is detected or set
    queryParameter: 'lang', // URL query parameter to change the locale (e.g., /?lang=de)
    cookie: 'locale', // Cookie name to store the user's preferred locale
    header: 'accept-language', // HTTP header to detect client's preferred language
    syncFiles: true, // Automatically synchronize translation files (creates missing keys/files)
    autoReload: true, // Reload translation files on changes (useful for development)
    updateFiles: true, // Update translation files (adds new keys with empty values)
    objectNotation: true // Enable object notation in translation files (e.g., { "key": { "nested": "value" } })
});

module.exports = i18n; // Export the configured i18n instance
