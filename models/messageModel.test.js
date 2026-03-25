/**
 * @module messageModelTests
 * @description
 * Tests for the MessageModel, ensuring it correctly provides the "Hello world!" message.
 */

const MessageModel = require('./messageModel'); // Import the MessageModel

describe('MessageModel', () => {
  /**
   * Test case: Verifies that getHelloWorldMessage returns the expected string.
   */
  test('should return "Hello world!" message', () => {
    // Call the static method directly on the MessageModel class
    const message = MessageModel.getHelloWorldMessage();

    // Assert that the returned message matches the expected value
    expect(message).toBe('Hello world!');
  });
});

