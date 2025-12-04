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

// This file is a conceptual TypeScript adaptation of CrashController.java.
// It implements an Express.js router to handle a route that explicitly throws an exception.

import { Router, Request, Response, NextFunction } from 'express';

/**
 * Express.js Router for showcasing exception handling.
 * Mimics `org.springframework.samples.petclinic.system.CrashController`.
 *
 * @author Michael Isvy
 * @author Michael Isvy (TypeScript adaptation)
 */
export class CrashController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Mimics @GetMapping("/oups")
    this.router.get('/oups', this.triggerExceptionRoute.bind(this));
  }

  /**
   * Method that intentionally throws a RuntimeException.
   * Mimics `public String triggerException()`.
   */
  public triggerException(): never {
    throw new Error(
      "Expected: controller used to showcase what happens when an exception is thrown"
    );
  }

  /**
   * Express route handler that calls `triggerException`.
   */
  private triggerExceptionRoute(req: Request, res: Response, next: NextFunction): void {
    // When `triggerException()` is called, it throws an error.
    // Express's error handling middleware (if configured) will catch this.
    try {
      this.triggerException();
    } catch (error) {
      next(error); // Pass the error to the next error handling middleware
    }
  }
}

// Export an instance of the controller.
export const crashController = new CrashController();
