/**
 * @module tests/app.test
 * @description
 * Test suite for the main application entry point, src/app.js.
 * This suite verifies the overall application flow, ensuring that it logs
 * startup/shutdown messages and correctly invokes the greetingController.
 * Due to app.js immediately executing its `main` function upon `require`,
 * special handling with `jest.resetModules()` and `jest.mock` is used for isolation.
 */

// Mock the greetingController globally for this test suite.
// This ensures that whenever `app.js` requires the controller, it gets this mock.
jest.mock('../src/controllers/greetingController', () => ({
  displayGreeting: jest.fn(), // Provide a mock function for displayGreeting
}));

// Get a reference to the mocked controller after it's been mocked.
const greetingController = require('../src/controllers/greetingController');

describe('app.js main function execution', () => {
  let consoleSpy;

  /**
   * Setup: Before each test, perform necessary isolation steps:
   * 1. Clear all mock calls on the controller.
   * 2. Spy on `console.log` to capture output and suppress actual console logs.
   * 3. Clear the module cache for `app.js` to ensure a fresh execution of `main()`
   *    every time it's `require`d in a test.
   */
  beforeEach(() => {
    greetingController.displayGreeting.mockClear();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.resetModules(); // Clears module cache, forcing app.js to be re-evaluated
  });

  /**
   * Teardown: After each test, restore the original `console.log` implementation.
   */
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  /**
   * Test case: Verifies the standard application startup and shutdown flow.
   * Ensures `app.js` logs "Application started...", calls the controller,
   * and then logs "Application finished.".
   */
  test('should log startup/shutdown messages and call greetingController.displayGreeting', () => {
    // Require `app.js` here. Its `main()` function will execute immediately.
    require('../src/app');

    // Assertions for console output
    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenCalledWith('Application started...');
    expect(consoleSpy).toHaveBeenCalledWith('Application finished.');

    // Assertions for controller interaction
    expect(greetingController.displayGreeting).toHaveBeenCalledTimes(1);
  });

  /**
   * Failure case: Simulates an error occurring within `greetingController.displayGreeting`.
   * This test verifies that `app.js` correctly logs "Application started..."
   * but does *not* log "Application finished." if an error is thrown in between.
   * The error should propagate from the `require` call.
   */
  test('should log "Application started..." but not "Application finished." if displayGreeting throws an error', () => {
    const mockError = new Error('Simulated error from greetingController');

    // Re-configure the mock controller's displayGreeting to throw an error.
    // This must be done *before* requiring app.js, as resetModules will make it pick up new mocks.
    jest.mock('../src/controllers/greetingController', () => ({
      displayGreeting: jest.fn(() => {
        throw mockError;
      }),
    }));
    // Get the reference to the *newly mocked* controller after resetModules and re-mocking.
    const newGreetingController = require('../src/controllers/greetingController');

    // Re-spy on console.log, as `jest.resetModules()` clears previous mocks/spies.
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Expect the `require` call to `app.js` to throw the simulated error.
    expect(() => require('../src/app')).toThrow(mockError);

    // Assertions for console output:
    // Only "Application started..." should be logged before the error propagates.
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith('Application started...');
    expect(consoleSpy).not.toHaveBeenCalledWith('Application finished.');

    // Assertions for controller interaction:
    // The controller's method should still have been attempted once.
    expect(newGreetingController.displayGreeting).toHaveBeenCalledTimes(1);
  });
});
