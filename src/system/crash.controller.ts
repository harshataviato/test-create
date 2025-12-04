import { Controller, Get, Render, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { I18n, I18nContext } from 'nestjs-i18n';

/**
 * @module System
 * @description
 * Controller used to showcase error handling by intentionally triggering an exception.
 * It demonstrates how a global exception filter can catch errors and render an error page.
 */
@Controller()
@UseFilters(HttpExceptionFilter) // Apply the custom exception filter to this controller
export class CrashController {
  /**
   * Handles requests to `/oups` and intentionally throws a `RuntimeException` (simulated by a standard Error).
   * The `HttpExceptionFilter` will catch this error and render the `error.hbs` template.
   *
   * @throws {Error} An intentional runtime exception to demonstrate error handling.
   */
  @Get('oups')
  triggerException(): string {
    throw new Error('Expected: controller used to showcase what happens when an exception is thrown');
  }
}
