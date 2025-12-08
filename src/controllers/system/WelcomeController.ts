/**
 * @module controllers/system/WelcomeController
 * @description Handles HTTP requests for the application's welcome page.
 *              Mimics Spring's `WelcomeController.java`.
 */

import { Request, Response, NextFunction } from 'express';
import { welcomeService } from '@services/system/WelcomeService';

/**
 * @class WelcomeController
 * @description Controller responsible for displaying the welcome page.
 */
export class WelcomeController {
  private welcomeService = welcomeService;

  /**
   * @method welcome
   * @description Renders the welcome page.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   */
  welcome(req: Request, res: Response): void {
    // Optionally, retrieve data from the service
    // const message = this.welcomeService.getWelcomeMessage();
    res.render('welcome', { menu: 'home' }); // Render welcome.ejs template, passing menu item for layout
  }
}

export const welcomeController = new WelcomeController();
