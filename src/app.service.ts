import { Injectable } from '@nestjs/common';

/**
 * @module App
 * @description
 * The root application service.
 * This can be used for general application-wide business logic.
 * Currently, it provides a simple "Hello World!" message.
 */
@Injectable()
export class AppService {
  /**
   * Returns a greeting message.
   *
   * @returns {string} The greeting "Hello World!".
   */
  getHello(): string {
    return 'Hello World!';
  }
}
