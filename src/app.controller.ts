import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Root application controller.
 * Handles requests to the homepage.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Renders the welcome page.
   * @returns The name of the EJS template to render ('welcome').
   */
  @Get()
  @Render('welcome')
  getWelcomePage(): void {
    // This method only needs to specify the template to render.
    // The data for the template can be handled by interceptors or default values in the template itself.
  }
}
