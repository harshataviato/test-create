/**
 * Internationalization Configuration
 * 
 * Configures the 'i18n' module to handle translations.
 * Reads JSON files from /locales (simulated in memory for this output).
 */
const i18n = require('i18n');
const path = require('path');

i18n.configure({
  locales: ['en', 'de', 'es'],
  directory: path.join(__dirname, '../locales'),
  defaultLocale: 'en',
  queryParameter: 'lang', // ?lang=de
  objectNotation: true,
  updateFiles: false // Do not write new keys at runtime
});

module.exports = i18n;
