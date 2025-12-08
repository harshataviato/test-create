/**
 * @module utils/errors
 * @description Defines custom error classes for better error handling throughout the application.
 */

/**
 * @class HttpError
 * @extends {Error}
 * @description Custom error class for HTTP-related errors.
 *              Allows associating an HTTP status code with the error.
 */
export class HttpError extends Error {
  /**
   * @property {number} status - The HTTP status code (e.g., 400, 404, 500).
   */
  public status: number;

  /**
   * @constructor
   * @param {number} status - The HTTP status code.
   * @param {string} message - The error message.
   */
  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    Object.setPrototypeOf(this, HttpError.prototype); // Maintain proper prototype chain
  }
}
