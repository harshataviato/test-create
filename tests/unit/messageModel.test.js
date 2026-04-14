/**
 * @module MessageModelUnitTests
 * @description Unit tests for the messageModel.js module.
 * These tests ensure that the message model correctly provides the "Hello world!" message.
 */

// Import the message model to be tested
const messageModel = require('../../models/messageModel');

describe('messageModel', () => {
  /**
   * Test case for the getHelloWorldMessage function.
   * It verifies that the function returns the expected "Hello world!" string.
   */
  test('getHelloWorldMessage should return "Hello world!"', () => {
    const expectedMessage = "Hello world!";
    const actualMessage = messageModel.getHelloWorldMessage();

    // Assert that the returned message matches the expected string
    expect(actualMessage).toBe(expectedMessage);
  });
});
