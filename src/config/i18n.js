/**
 * Internationalization (i18n) Configuration.
 * 
 * Sets up locale support for English, German, and Spanish.
 * Configures cookie-based storage and query parameter overrides.
 */

const i18n = require('i18n');
const path = require('path');

i18n.configure({
  // Setup supported locales
  locales: ['en', 'de', 'es'],
  
  // path to the translation files
  directory: path.join(__dirname, '../locales'),
  
  // default locale
  defaultLocale: 'en',
  
  // sets a custom cookie name to parse locale settings from
  cookie: 'petclinic_locale',
  
  // query parameter to switch locale (e.g. ?lang=de)
  queryParameter: 'lang',
  
  // Enable object notation (e.g. 'nav.home')
  objectNotation: true
});

module.exports = i18n;
