/**
 * @file Internationalization (i18n) middleware.
 * @description This middleware ensures that the i18n instance is properly configured and
 * that the locale is set for each request, making translation functions available.
 * It mirrors the functionality of Spring's `LocaleChangeInterceptor` and `SessionLocaleResolver`.
 * @author Google Senior Engineer
 */

const i18n = require('i18n');
const config = require('../config');

/**
 * Middleware to resolve and set the locale for the current request.
 * It checks the URL query parameter first, then the session, falling back to the default locale.
 * @returns {import('express').RequestHandler} Express middleware function.
 */
function localeResolver() {
  return (req, res, next) => {
    let locale = config.i18n.defaultLocale; // Default locale from config

    // 1. Check for locale in query parameter (e.g., ?lang=de)
    if (req.query[config.i18n.queryParameter]) {
      locale = req.query[config.i18n.queryParameter];
      req.session.locale = locale; // Persist in session for future requests
    }
    // 2. Check for locale in session
    else if (req.session.locale) {
      locale = req.session.locale;
    }

    // Set the resolved locale for the current request
    i18n.setLocale(req, locale);
    // Make i18n functions available to response locals (for EJS templates)
    res.locals.__ = res.__;
    res.locals.__n = res.__n;
    next();
  };
}

/**
 * Middleware to intercept language changes.
 * This is primarily handled by `localeResolver` in this Node.js setup by checking `req.query`.
 * This function serves as a placeholder to mirror the Java `LocaleChangeInterceptor` concept.
 * @returns {import('express').RequestHandler} Express middleware function.
 */
function localeChangeInterceptor() {
  return (req, res, next) => {
    // Logic for changing locale is already in localeResolver,
    // this can be extended for more complex interception if needed.
    next();
  };
}

module.exports = {
  localeResolver,
  localeChangeInterceptor
};
