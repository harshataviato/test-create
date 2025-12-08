/**
 * @module services/system/CrashService
 * @description Provides a service to simulate an application crash for testing error handling.
 *              Mimics Spring's `CrashController` functionality.
 */

/**
 * @class CrashService
 * @description Service class to simulate an intentional runtime exception.
 */
export class CrashService {
  /**
   * @method triggerException
   * @description Throws a `RuntimeException` to simulate an application crash.
   * @throws {Error} An intentional error with a descriptive message.
   */
  triggerException(): void {
    throw new Error('Expected: service used to showcase what happens when an exception is thrown');
  }
}

export const crashService = new CrashService();
