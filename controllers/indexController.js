/**
 * @fileoverview Controller for handling general application routes like home, error pages, and locale changes.
 */

const i18n = require('../config/i18n'); // Internationalization configuration

/**
 * @function home
 * @description Renders the application's home page.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 */
exports.home = (req, res) => {
  res.render('home', { title: req.__('home.welcome') });
};

/**
 * @function oups
 * @description Renders a generic error page, often used for manual error triggering or testing.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
exports.oups = (req, res, next) => {
  // Simulate an intentional error for demonstration or specific error page rendering
  const err = new Error(req.__('error.oups'));
  err.status = 500;
  next(err); // Pass the error to the global error handler
};

/**
 * @function changeLocale
 * @description Changes the application's locale based on the 'lang' query parameter
 * and redirects to the referer or home page.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 */
exports.changeLocale = (req, res) => {
  if (req.query.lang && i18n.locales.includes(req.query.lang)) {
    req.session.locale = req.query.lang;
    i18n.setLocale(req, req.query.lang); // Use req-specific i18n instance
    req.flash('message', req.__('locale.changed', req.query.lang));
  } else {
    req.flash('error', req.__('locale.invalid'));
  }
  const referer = req.header('Referer') || '/';
  res.redirect(referer);
};

