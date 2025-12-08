import { Controller, Get, Render } from '@nestjs/common';

/**
 * Controller for the welcome page of the application.
 * Handles requests to the root path and renders the `welcome` template.
 */
@Controller() // Accessible at the root path '/'
export class WelcomeController {
  /**
   * Renders the welcome page.
   * This method is mapped to the root URL (`/`).
   * @returns The name of the EJS template to render ('welcome').
   */
  @Get('/')
  @Render('welcome')
  welcome(): void {
    // No specific data is passed to the welcome template from here.
    // The template might rely on global variables or i18n context.
  }
}
