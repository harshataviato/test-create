/**
 * @file helloModel.test.js
 * @description Unit tests for the helloModel.
 *              Verifies that the model correctly provides the "Hello World" message.
 */

// Import assertion library
const { expect } = require('chai');
// Import the model to be tested
const helloModel = require('../../models/helloModel');

describe('Hello Model Unit Tests', () => {
  /**
   * Test case: Ensure getMessage() returns the expected "Hello world!" string.
   */
  it('should return the "Hello world!" message', () => {
    // Call the function from the model
    const message = helloModel.getMessage();

    // Assert that the returned message is exactly "Hello world!"
    expect(message).to.equal('Hello world!');
    // Assert that the returned message is a string
    expect(message).to.be.a('string');
    // Assert that the message is not empty
    expect(message).to.not.be.empty;
  });
});
