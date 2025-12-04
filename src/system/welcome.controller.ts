import { Controller, Get, Render } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';

/**
 * @module System
 * @description
 * Controller for the application's welcome page.
 * Handles requests to the root path `/` and renders the `welcome.hbs` template.
 */
@Controller()
export class WelcomeController {
  /**
   * Handles GET requests to the root path `/`.
   * Renders the `welcome.hbs` template.
   *
   * @param {I18nContext} i18n - The i18n context for translating messages.
   * @returns {object} An object containing data to be passed to the template.
   */
  @Get('/')
  @Render('welcome') // Specifies the Handlebars template to render
  welcome(@I18n() i18n: I18nContext) {
    return {
      welcome: i18n.t('welcome'), // Translate the 'welcome' message
      currentMenu: 'home', // Highlight 'Home' in the navigation
    };
  }
}
