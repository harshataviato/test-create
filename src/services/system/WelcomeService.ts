/**
 * @module services/system/WelcomeService
 * @description Provides a simple service for the welcome page.
 *              Mimics Spring's `WelcomeController` functionality.
 */

/**
 * @class WelcomeService
 * @description Service class to handle logic for the welcome page.
 *              Currently, it's very simple but can be extended if needed.
 */
export class WelcomeService {
  /**
   * @method getWelcomeMessage
   * @description Returns a welcome message.
   * @returns {string} The welcome message.
   */
  getWelcomeMessage(): string {
    // In a real scenario, this might fetch data or perform some logic
    // For now, it's just a placeholder for the welcome view.
    return 'Welcome to PetClinic!';
  }
}

export const welcomeService = new WelcomeService();
