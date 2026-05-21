/**
 * @module tests/greetingController.test
 * @description
 * Test suite for the greetingController.js module.
 * Verifies that the controller correctly orchestrates the interaction between
 * the greetingModel and the consoleView.
 * This involves mocking both the model and the view to isolate the controller's logic.
 */

// Import the controller to be tested
const greetingController = require('../src/controllers/greetingController');

// Import the dependencies of the controller so we can mock them
const greetingModel = require('../src/models/greetingModel');
const consoleView = require('../src/views/consoleView');

// Mock the entire modules for greetingModel and consoleView.
// Jest will automatically replace their exports with mock functions.
jest.mock('../src/models/greetingModel');
jest.mock('../src/views/consoleView');

describe('greetingController', () => {
  /**
   * Setup: Before each test, clear all mock calls and reset their implementations.
   * This ensures that each test runs with a clean state and no lingering mock behavior.
   */
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test case: Ensures `displayGreeting` calls `getGreeting` from the model
   * and then `render` from the view with the returned message.
   * This covers the primary success flow of the controller.
   */
  test('displayGreeting should fetch greeting from model and render it via view', () => {
    const mockGreetingMessage = 'Mocked Hello World!';

    // Configure the mock model's getGreeting to return a specific value
    greetingModel.getGreeting.mockReturnValue(mockGreetingMessage);

    // Call the controller method under test
    greetingController.displayGreeting();

    // Assertions:
    // 1. Verify that the model's getGreeting method was called exactly once.
    expect(greetingModel.getGreeting).toHaveBeenCalledTimes(1);
    // 2. Verify that the view's render method was called exactly once.
    expect(consoleView.render).toHaveBeenCalledTimes(1);
    // 3. Verify that the view's render method was called with the message obtained from the model.
    expect(consoleView.render).toHaveBeenCalledWith(mockGreetingMessage);
  });

  /**
   * Edge case: Verifies `displayGreeting` handles scenarios where the model might return
   * a different or unexpected message (e.g., empty string).
   */
  test('displayGreeting should correctly pass an empty greeting from the model to the view', () => {
    const emptyGreeting = '';
    greetingModel.getGreeting.mockReturnValue(emptyGreeting);

    greetingController.displayGreeting();

    expect(greetingModel.getGreeting).toHaveBeenCalledTimes(1);
    expect(consoleView.render).toHaveBeenCalledTimes(1);
    expect(consoleView.render).toHaveBeenCalledWith(emptyGreeting);
  });

  /**
   * Edge case: Verifies `displayGreeting` handles if the model returns a falsy value like `null` or `undefined`.
   * While the current model explicitly returns a string, this tests controller robustness.
   */
  test('displayGreeting should handle falsy return values from the model', () => {
    // Test with null
    greetingModel.getGreeting.mockReturnValue(null);
    greetingController.displayGreeting();
    expect(consoleView.render).toHaveBeenCalledWith(null);
    expect(greetingModel.getGreeting).toHaveBeenCalledTimes(1);
    expect(consoleView.render).toHaveBeenCalledTimes(1);

    jest.clearAllMocks(); // Clear mocks for the next part of this test

    // Test with undefined
    greetingModel.getGreeting.mockReturnValue(undefined);
    greetingController.displayGreeting();
    expect(consoleView.render).toHaveBeenCalledWith(undefined);
    expect(greetingModel.getGreeting).toHaveBeenCalledTimes(1);
    expect(consoleView.render).toHaveBeenCalledTimes(1);
  });

  /**
   * Failure case simulation (though the current app doesn't handle it gracefully):
   * What if the model throws an error? The controller would just let it propagate.
   * This test ensures that the controller doesn't try to call the view if the model fails.
   */
  test('displayGreeting should propagate error if greetingModel.getGreeting throws', () => {
    const modelError = new Error('Failed to get greeting from model');
    greetingModel.getGreeting.mockImplementation(() => {
      throw modelError;
    });

    // Expecting the controller to throw the same error
    expect(() => greetingController.displayGreeting()).toThrow(modelError);

    // Verify that getGreeting was called, but render was NOT called.
    expect(greetingModel.getGreeting).toHaveBeenCalledTimes(1);
    expect(consoleView.render).not.toHaveBeenCalled();
  });
});
