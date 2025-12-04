import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * @module App
 * @description
 * The root application controller.
 * This can be used for general application-wide endpoints, or for
 * testing the basic functionality of the application.
 * Currently, it's a placeholder if a root level API endpoint is desired.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Example root GET endpoint.
   * Not used in the current PetClinic UI, but available for API testing.
   *
   * @returns {string} A simple "Hello World!" message.
   */
  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }
}
