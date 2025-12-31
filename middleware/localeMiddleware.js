/**
 * @module middleware/localeMiddleware
 * @description Express middleware for handling locale changes.
 * Checks for a `lang` query parameter and sets the `i18n` locale accordingly.
 */

const i18n = require('../config/i18n');

/**
 * @function localeMiddleware
 * @description Middleware to change the application's locale based on a query parameter.
 * If `req.query.lang` is present, it sets the locale and redirects to the original URL
 * without the `lang` parameter to keep the URL clean.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */
const localeMiddleware = (req, res, next) => {
  const lang = req.query.lang;
  if (lang) {
    // Set the locale using i18n-node's API
    i18n.setLocale(req, lang);
    // Optionally, redirect to the same page without the ?lang= parameter
    // to keep the URL clean after changing the locale.
    // This makes the locale persist via cookie.
    const redirectUrl = req.originalUrl.split('?')[0]; // Remove query string
    return res.redirect(redirectUrl);
  }
  next();
};

module.exports = localeMiddleware;
