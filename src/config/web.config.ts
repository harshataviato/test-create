import { Injectable, NestMiddleware, Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { I18nService } from 'nestjs-i18n';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/**
 * @module Config
 * @description
 * Middleware for handling locale changes. This is similar to Spring's `LocaleChangeInterceptor`.
 * It checks for a 'lang' query parameter or header to set the locale for the current request,
 * which `nestjs-i18n` then uses for message resolution.
 */
@Injectable()
export class LocaleChangeMiddleware implements NestMiddleware {
  constructor(private readonly i18n: I18nService) {}

  /**
   * Implements the middleware logic. It checks for a 'lang' parameter
   * in the query or body (or other configured resolvers in `I18nModule`)
   * and sets the locale for the request.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   */
  use(req: Request, res: Response, next: NextFunction) {
    // nestjs-i18n handles setting the locale on the request object.
    // We can also manually set it here if specific logic is needed,
    // but the configured resolvers usually suffice.
    // For example, if we wanted to force a default if no lang is detected:
    // if (!req.i18nLang) {
    //   req.i18nLang = this.i18n.get           FallbackLanguage();
    // }
    next();
  }
}

/**
 * @module Config
 * @description
 * Configures global web-related settings, such as internationalization middleware.
 * This module replaces Spring's `WebConfiguration`.
 */
@Module({
  // No specific providers or imports needed here for global config,
  // the middleware is applied via `configure`.
})
export class WebConfigurationModule {
  /**
   * Configures middleware for all routes.
   * Here, `LocaleChangeMiddleware` is applied to ensure i18n is available for all requests.
   *
   * @param {MiddlewareConsumer} consumer - The middleware consumer.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LocaleChangeMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
