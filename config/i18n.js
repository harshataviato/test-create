/**
 * @fileoverview Internationalization (i18n) configuration for the Express application.
 * This file uses the 'i18n' npm package to handle multi-language support.
 * It defines supported locales, translation file paths, and sets up a middleware
 * to determine the current locale based on session or query parameters.
 */

const i18n = require('i18n');
const path = require('path');

// Configure i18n
i18n.configure({
  locales: ['en', 'de', 'es', 'fa', 'ko', 'pt', 'ru', 'tr'], // Supported locales
  directory: path.join(__dirname, '../messages'), // Path to translation JSON files
  defaultLocale: 'en', // Default locale if no other is specified
  autoReload: true, // Reload translation files automatically in development
  syncFiles: true, // Create new locale files with default translations if they don't exist
  cookie: 'lang', // Name of the cookie to store the locale
  queryParameter: 'lang', // Query parameter to change the locale (e.g., ?lang=de)
  // Registering the translation helper functions globally for EJS
  register: global
});

// Custom middleware to set locale for each request
/**
 * @function setLocaleMiddleware
 * @description Express middleware to set the locale for the current request.
 * It checks the 'lang' query parameter first, then the session, then the cookie,
 * and finally defaults to 'en'.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
function setLocaleMiddleware(req, res, next) {
  // Check if a 'lang' query parameter is provided (e.g., /owners?lang=de)
  if (req.query.lang) {
    req.session.locale = req.query.lang; // Store in session
    i18n.setLocale(req.query.lang); // Set for current request
  } else if (req.session.locale) {
    // If locale is stored in session, use it
    i18n.setLocale(req.session.locale);
  } else {
    // Fallback to default locale
    i18n.setLocale(i18n.defaultLocale);
  }
  next();
}

// Export the i18n instance and the custom middleware
module.exports = {
  init: i18n.init, // i18n initialization middleware (should be app.use(i18n.init))
  setLocale: setLocaleMiddleware, // Custom middleware to be used after session
  __: i18n.__, // Direct access to translation function
  __n: i18n.__n, // Direct access to pluralization function
  getLocale: i18n.getLocale // Direct access to get current locale
};
