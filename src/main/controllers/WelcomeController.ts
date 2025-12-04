/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file is a conceptual TypeScript adaptation of WelcomeController.java.
// It implements a simple Express.js router to handle the application's home page.

import { Router, Request, Response } from 'express';
import { WelcomeService } from '../services/WelcomeService'; // Assuming WelcomeService is defined

/**
 * Express.js Router for the Welcome page.
 * Mimics `org.springframework.samples.petclinic.system.WelcomeController`.
 *
 * @author Juergen Hoeller
 * @author Michael Isvy (TypeScript adaptation)
 */
export class WelcomeController {
  public router: Router;

  constructor(private welcomeService: WelcomeService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Mimics @GetMapping("/")
    this.router.get('/', this.welcome.bind(this));
  }

  /**
   * Renders the welcome page.
   * Mimics `public String welcome()`.
   */
  private welcome(req: Request, res: Response): void {
    // The original `return "welcome"` refers to a Thymeleaf template named "welcome.html".
    // In Express.js with a templating engine like EJS, we would call `res.render('welcome')`.
    res.render('welcome', {
      t: req.t, // Pass translation function to template
      activeMenu: 'home',
      message: this.welcomeService.getWelcomeMessage(), // Example of passing data to template
      // Any flash messages from redirects would be in `req.query` in Express setup
      // Example: error: req.query.error
    });
  }
}

// Export an instance of the controller.
import { welcomeService } from '../services/WelcomeService';
export const welcomeController = new WelcomeController(welcomeService);
