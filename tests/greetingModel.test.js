/**
 * @module tests/greetingModel.test
 * @description
 * Test suite for the greetingModel.js module.
 * Verifies that the model correctly provides the "Hello world!" greeting message.
 */

const greetingModel = require('../src/models/greetingModel');

describe('greetingModel', () => {
  /**
   * Test case: Ensures getGreeting returns the static "Hello world!" string.
   * This covers the primary success scenario for the model.
   */
  test('getGreeting should return "Hello world!"', () => {
    const greeting = greetingModel.getGreeting();
    expect(greeting).toBe('Hello world!');
  });

  /**
   * Edge case: Verifies that the returned value is indeed a string.
   */
  test('getGreeting should return a string', () => {
    const greeting = greetingModel.getGreeting();
    expect(typeof greeting).toBe('string');
  });

  /**
   * Edge case: Ensures the string is not empty.
   */
  test('getGreeting should return a non-empty string', () => {
    const greeting = greetingModel.getGreeting();
    expect(greeting.length).toBeGreaterThan(0);
  });
});
