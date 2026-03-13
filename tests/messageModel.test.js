const MessageModel = require('../models/messageModel');

/**
 * Unit tests for MessageModel
 */
describe('MessageModel', () => {
  test('getGreeting should return the correct string', () => {
    const expectedMessage = "Hello world!";
    const actualMessage = MessageModel.getGreeting();
    
    expect(actualMessage).toBe(expectedMessage);
    expect(typeof actualMessage).toBe('string');
  });

  test('getGreeting should not return an empty string', () => {
    const actualMessage = MessageModel.getGreeting();
    expect(actualMessage.length).toBeGreaterThan(0);
  });
});
