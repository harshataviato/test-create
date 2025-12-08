/**
 * @module middlewares/i18nMiddleware
 * @description Custom middleware for handling locale changes based on a URL query parameter.
 *              Mimics Spring's `LocaleChangeInterceptor`.
 */

import { Request, Response, NextFunction } from 'express';
import i18n from 'i18next'; // Import the i18next instance

/**
 * @function localeChangeMiddleware
 * @description Express middleware to change the application's locale.
 *              Looks for a 'lang' query parameter (e.g., `?lang=es`) and updates the i18next instance's language.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
export function localeChangeMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Check if a 'lang' query parameter is present
  const langParam = req.query.lang as string;

  if (langParam && i18n.languages.includes(langParam)) {
    // If a valid language parameter is found, change the current language
    req.i18n.changeLanguage(langParam);
    // Optionally set a cookie to remember the preference
    res.cookie('i18next', langParam, { maxAge: 900000, httpOnly: true });
  }

  next(); // Continue to the next middleware or route handler
}
