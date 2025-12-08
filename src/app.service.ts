import { Injectable } from '@nestjs/common';

/**
 * Provides application-wide services.
 * Currently, it's a placeholder but can be extended for global business logic.
 */
@Injectable()
export class AppService {
  /**
   * Returns a simple greeting message.
   * @returns A string greeting.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
