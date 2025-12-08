import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

/**
 * Catches all HTTP exceptions and renders a custom error page or returns a JSON error response.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  /**
   * Catches an HttpException and processes it.
   * If the request expects HTML, it renders an error page. Otherwise, it sends a JSON response.
   * @param exception The caught HttpException.
   * @param host The ArgumentsHost object, providing access to request and response objects.
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse(); // Get raw error response from exception

    let message: string;
    let i18nKey: string;

    // Determine the message and i18n key based on the status
    if (typeof errorResponse === 'object' && errorResponse !== null && 'message' in errorResponse) {
      // If the error response contains a 'message' property (e.g., from class-validator)
      const rawMessage = (errorResponse as any).message;
      if (Array.isArray(rawMessage) && rawMessage.length > 0) {
        // If message is an array (e.g., from I18nValidationPipe), take the first one
        i18nKey = rawMessage[0];
      } else {
        i18nKey = rawMessage;
      }
    } else {
      // Fallback for other HttpExceptions
      i18nKey = exception.message;
    }

    // Attempt to translate the message
    // If translation fails, use the original i18nKey as the message
    try {
      message = this.i18n.translate(`messages.${i18nKey}`, { lang: request.i18nLang });
    } catch (e) {
      message = i18nKey;
    }


    // Check if the request expects HTML (e.g., from a browser)
    if (request.headers.accept?.includes('text/html')) {
      response.status(status).render('error', {
        status: status,
        message: message,
        path: request.url,
        // Pass translated messages needed in the error.ejs template
        somethingHappened: this.i18n.translate('messages.somethingHappened', { lang: request.i18nLang }),
        error404: this.i18n.translate('messages.error.404', { lang: request.i18nLang }),
        error500: this.i18n.translate('messages.error.500', { lang: request.i18nLang }),
        errorGeneral: this.i18n.translate('messages.error.general', { lang: request.i18nLang }),
      });
    } else {
      // For API requests, send a JSON response
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: message,
      });
    }
  }
}
