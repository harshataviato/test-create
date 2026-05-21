/**
 * @module tests/consoleView.test
 * @description
 * Test suite for the consoleView.js module.
 * Verifies that the view correctly renders messages to the console using console.log.
 * This requires mocking console.log to capture its calls without side effects during tests.
 */

const consoleView = require('../src/views/consoleView');

describe('consoleView', () => {
  let consoleSpy;

  /**
   * Setup: Before each test, spy on `console.log`.
   * This allows us to assert if `console.log` was called and with what arguments,
   * while suppressing actual output to the test runner's console.
   */
  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  /**
   * Teardown: After each test, restore the original `console.log` implementation.
   * This ensures test isolation and prevents mocks from leaking between tests.
   */
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  /**
   * Test case: Ensures `render` calls `console.log` with the provided message.
   * This covers the primary success scenario for the view.
   */
  test('render should call console.log with the correct message', () => {
    const testMessage = 'This is a test message.';
    consoleView.render(testMessage);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(testMessage);
  });

  /**
   * Edge case: Verifies `render` handles an empty string message correctly.
   */
  test('render should handle empty string message', () => {
    const emptyMessage = '';
    consoleView.render(emptyMessage);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(emptyMessage);
  });

  /**
   * Edge case: Verifies `render` can handle non-string primitive messages.
   * `console.log` is designed to convert arguments to strings, so this ensures compatibility.
   */
  test('render should handle non-string messages (e.g., numbers, booleans)', () => {
    const numberMessage = 12345;
    consoleView.render(numberMessage);
    expect(consoleSpy).toHaveBeenCalledWith(numberMessage);
    consoleSpy.mockClear(); // Clear for next assertion

    const booleanMessage = true;
    consoleView.render(booleanMessage);
    expect(consoleSpy).toHaveBeenCalledWith(booleanMessage);
    consoleSpy.mockClear(); // Clear for next assertion

    const nullMessage = null;
    consoleView.render(nullMessage);
    expect(consoleSpy).toHaveBeenCalledWith(nullMessage);
  });

  /**
   * Edge case: Verifies `render` handles objects/arrays, as `console.log` does.
   */
  test('render should handle object and array messages', () => {
    const objectMessage = {
      id: 1,
      name: 'Test Object'
    };
    consoleView.render(objectMessage);
    expect(consoleSpy).toHaveBeenCalledWith(objectMessage);
    consoleSpy.mockClear();

    const arrayMessage = ['item1', 'item2'];
    consoleView.render(arrayMessage);
    expect(consoleSpy).toHaveBeenCalledWith(arrayMessage);
  });
});
