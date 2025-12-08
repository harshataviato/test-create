import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { I18nService } from 'nestjs-i18n';

/**
 * Custom middleware to handle locale changes based on query parameters and session.
 * It sets the i18n language for the request and stores it in the session.
 */
@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private readonly i18n: I18nService) {}

  /**
   * Express-style middleware function.
   * Checks for a 'lang' query parameter; if present, it updates the session and cookie.
   * Sets the resolved language on the request object.
   * @param req The Express request object.
   * @param res The Express response object.
   * @param next The next middleware function.
   */
  use = (req: Request, res: Response, next: NextFunction) => {
    const langFromQuery = req.query.lang as string;
    const langFromSession = (req.session as any)?.lang as string;

    let currentLang = this.i18n.resolveLanguage(req); // Resolve language from standard resolvers (query, cookie, header)

    // If a 'lang' query parameter is provided, prioritize it and update session/cookie
    if (langFromQuery) {
      currentLang = langFromQuery;
      if (req.session) {
        (req.session as any).lang = currentLang; // Store in session
      }
      res.cookie('lang', currentLang); // Store in cookie
    } else if (langFromSession) {
      // If no query param, but language is in session, use it
      currentLang = langFromSession;
    }

    // Set the resolved language on the request object for later use by I18nService
    (req as any).i18nLang = currentLang;
    next();
  };
}
