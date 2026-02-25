/**
 * @file i18nMiddleware.js
 * @description Express middleware for internationalization (i18n).
 * This middleware integrates the `i18n` package with Express, allowing
 * language selection via query parameters and providing translation functions
 * to request and response objects. It replaces Spring's WebConfiguration.java for i18n setup.
 * @param {object} i18nInstance - The configured i18n instance.
 * @returns {function} Express middleware function.
 * @author Google Senior Engineer
 */

const i18nMiddleware = (i18nInstance) => (req, res, next) => {
  // Bind i18n to request and response objects
  i18nInstance.init(req, res);

  // Check for 'lang' query parameter to change locale
  if (req.query.lang) {
    i18nInstance.setLocale(req.query.lang);
  }

  // Make i18n helper function available to views via res.locals
  // This allows templates to use `res.locals.__('key')` or `__('key')` directly if passed
  res.locals.__ = i18nInstance.__;
  res.locals.__n = i18nInstance.__n;

  next();
};

module.exports = i18nMiddleware;
