const { expect } = require('chai');
const MessageModel = require('../models/messageModel');

describe('MessageModel Unit Tests', () => {
  /**
   * Test Case: Verify correct greeting retrieval
   * Scenario: Call getGreeting() method
   * Expected: Returns exactly "Hello world!"
   */
  it('should return the correct greeting message "Hello world!"', () => {
    const message = MessageModel.getGreeting();
    expect(message).to.be.a('string');
    expect(message).to.equal('Hello world!');
  });

  /**
   * Test Case: Consistency check
   * Scenario: Call getGreeting() multiple times
   * Expected: Value remains idempotent
   */
  it('should consistently return the same message on repeated calls', () => {
    const firstCall = MessageModel.getGreeting();
    const secondCall = MessageModel.getGreeting();
    expect(firstCall).to.equal(secondCall);
  });
});
