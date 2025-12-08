/**
 * @module controllers/system/CrashController
 * @description Handles HTTP requests for triggering an intentional exception.
 *              Mimics Spring's `CrashController.java`.
 */

import { Request, Response, NextFunction } from 'express';
import { crashService } from '@services/system/CrashService';

/**
 * @class CrashController
 * @description Controller used to showcase what happens when an exception is thrown.
 *              This is useful for testing global error handling.
 */
export class CrashController {
  private crashService = crashService;

  /**
   * @method triggerException
   * @description Triggers a `RuntimeException` to demonstrate error page functionality.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   * @throws {Error} An intentional error to be caught by the global error handler.
   */
  triggerException(req: Request, res: Response, next: NextFunction): void {
    this.crashService.triggerException(); // The service method will throw the error
  }
}

export const crashController = new CrashController();
