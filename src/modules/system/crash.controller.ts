import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

/**
 * Controller used to showcase how exceptions are handled within the application.
 * It intentionally triggers a `RuntimeException` (simulated by `HttpException`)
 * to demonstrate global exception filter functionality.
 */
@Controller() // No specific prefix, accessible directly from root
export class CrashController {
  constructor(private readonly i18n: I18nService) {}

  /**
   * Endpoint to trigger a simulated runtime exception.
   * This method throws an `HttpException` (equivalent to Spring's `RuntimeException`)
   * which will be caught by the global `HttpExceptionFilter`.
   * @returns This method is not expected to return, as it always throws an exception.
   * @throws HttpException with status 500 and a descriptive message.
   */
  @Get('oups')
  triggerException(): never {
    // Simulate a RuntimeException with an internal server error status
    throw new HttpException(
      this.i18n.translate('messages.expectedException', {
        lang: 'en',
        args: {
          context: 'controller used to showcase what happens when an exception is thrown',
        },
      }),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
