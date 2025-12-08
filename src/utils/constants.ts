/**
 * @module utils/constants
 * @description
 * Contains shared constants and utility functions used across the application.
 */

import { ValidationError } from 'class-validator';

/**
 * Constants used throughout the application.
 */
export const Constants = {
  DEFAULT_PORT: 8080, // Default port for the Express server
  VET_CACHE_TTL: 5 * 60 * 1000, // 5 minutes in milliseconds for vet list cache
  DEFAULT_PAGE_SIZE: 5, // Default number of items per page for pagination
};

/**
 * Formats an array of `ValidationError` objects into a single readable string.
 * This string can be used for flash messages or error displays in templates.
 *
 * @param {ValidationError[]} errors - An array of `ValidationError` objects from `class-validator`.
 * @returns {string} A concatenated string of all validation error messages.
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(error => {
    // Check if constraints exist and join them, otherwise return a generic message
    if (error.constraints) {
      return Object.values(error.constraints).join('; ');
    }
    return `Validation error on ${error.property}`;
  }).join('; ');
}

// Extend Express Request and Response types to include i18n properties
declare global {
  namespace Express {
    interface Request {
      i18n: any; // i18next instance
      t: (key: string, options?: { [key: string]: any }) => string; // Translation function
    }
    interface Response {
      locals: {
        owner?: any;
        pet?: any;
        visit?: any;
        types?: any;
        specialties?: any;
        // Add other properties that might be set on res.locals
        menu?: string; // For active menu item
        message?: string; // For flash success messages
        error?: string; // For flash error messages
        // Add any other properties your app might put on res.locals
      };
    }
  }
}
