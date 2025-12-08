/**
 * @module middleware/validation.middleware
 * @description
 * Provides a generic validation middleware for Express.js routes using `class-validator`.
 * This middleware can be used to validate incoming request bodies against a DTO class.
 */

import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { formatValidationErrors } from '../utils/constants';

/**
 * Generic validation middleware for Express routes.
 * It takes a DTO (Data Transfer Object) class and an optional `skipMissingProperties` flag.
 * If validation errors are found, it stores them in the session as a flash message
 * and re-renders the previous form.
 *
 * @param {any} dtoClass - The class of the DTO to validate against.
 * @param {boolean} [skipMissingProperties=false] - Whether to skip validation of properties that are missing from the request body.
 * @returns {Function} An Express middleware function.
 */
export function validationMiddleware(dtoClass: any, skipMissingProperties = false): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    // Transform the plain request body object into an instance of the DTO class
    const instance = plainToInstance(dtoClass, req.body);

    // Validate the DTO instance
    validate(instance, { skipMissingProperties })
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          // If there are validation errors, format them and store in session.
          // This allows for flash messages on redirect or re-rendering with errors.
          (req.session as any).error = formatValidationErrors(errors);
          console.log('Validation Errors:', errors); // Log errors for debugging

          // Pass the errors directly to the response locals for rendering
          res.locals.validationErrors = errors;

          // Re-render the form or redirect, depending on controller logic.
          // For now, we'll just return so the controller can decide.
          next(new Error("Validation Failed")); // Or, better, handle in controller.
        } else {
          // If validation passes, replace the request body with the transformed DTO instance.
          // This ensures that subsequent middleware/handlers work with a validated and typed object.
          req.body = instance;
          next();
        }
      })
      .catch(error => {
        // Catch any unexpected errors during validation process
        next(error);
      });
  };
}
