import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';

/**
 * @module System
 * @description
 * A global exception filter to catch `HttpException`s (and other `Error`s)
 * and render a custom error page (`error.hbs`).
 * This filter is analogous to Spring Boot's default error handling mechanism,
 * but specifically for rendering views with internationalization support.
 */
@Catch() // Catch all types of exceptions
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Catches an exception and processes it to render an appropriate error page.
   *
   * @param {unknown} exception - The caught exception.
   * @param {ArgumentsHost} host - The arguments host, providing access to request and response objects.
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const i18n = I18nContext.current(); // Get the current i18n context for translation

    // Determine HTTP status code
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determine error message
    let message: string;
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message;
    } else if (exception instanceof Error) {
      message = exception.message;
    } else {
      message = 'An unexpected error occurred';
    }

    // Translate specific error messages using i18n
    let translatedStatusMessage: string;
    switch (status) {
      case HttpStatus.NOT_FOUND:
        translatedStatusMessage = i18n.t('error.404');
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        translatedStatusMessage = i18n.t('error.500');
        break;
      default:
        translatedStatusMessage = i18n.t('error.general');
        break;
    }

    // Render the error page with relevant details
    response.status(status).render('error', {
      status: status,
      message: message,
      path: request.url,
      // Pass translated messages for the error page
      error404: i18n.t('error.404'),
      error500: i18n.t('error.500'),
      errorGeneral: i18n.t('error.general'),
      somethingHappened: i18n.t('somethingHappened'),
      currentMenu: 'error', // Highlight 'Error' in the navigation
    });
  }
}
