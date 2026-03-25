/**
 * @file helloController.test.js
 * @description Unit tests for the helloController.
 *              Verifies that the controller interacts with the model and renders the view correctly.
 */

// Import assertion library
const { expect } = require('chai');
// Import mocking/stubbing library
const sinon = require('sinon');
// Import the controller to be tested
const helloController = require('../../controllers/helloController');
// Import the model which the controller depends on (to mock it)
const helloModel = require('../../models/helloModel');

describe('Hello Controller Unit Tests', () => {
  let helloModelStub; // Stub for helloModel.getMessage
  let res;            // Mock response object
  let req;            // Mock request object

  // Setup before each test
  beforeEach(() => {
    // Create a stub for helloModel.getMessage() to control its return value
    helloModelStub = sinon.stub(helloModel, 'getMessage');

    // Create mock req and res objects
    // res.render needs to be a sinon spy to check if it was called with the correct arguments
    res = {
      render: sinon.spy(),
    };
    req = {}; // No specific properties needed for req in this controller
  });

  // Teardown after each test
  afterEach(() => {
    // Restore all stubs/spies created with sinon to ensure test isolation
    sinon.restore();
  });

  /**
   * Test case: Ensure getHelloWorldPage renders the 'hello' view with the correct message.
   */
  it('should render the "hello" view with the message retrieved from the model', () => {
    const expectedMessage = 'Test Hello Message';
    // Configure the stub to return our expected message
    helloModelStub.returns(expectedMessage);

    // Call the controller function
    helloController.getHelloWorldPage(req, res);

    // Assert that helloModel.getMessage was called exactly once
    expect(helloModelStub.calledOnce).to.be.true;

    // Assert that res.render was called exactly once
    expect(res.render.calledOnce).to.be.true;

    // Assert that res.render was called with 'hello' as the view name
    // and an object containing the expected message
    expect(res.render.calledWith('hello', { message: expectedMessage })).to.be.true;
  });

  /**
   * Test case: Ensure getHelloWorldPage still renders correctly even with a different message from the model.
   * This verifies the controller's logic is robust to changes in model output.
   */
  it('should render the "hello" view with a different message if the model provides one', () => {
    const alternateMessage = 'Greetings from Test!';
    helloModelStub.returns(alternateMessage);

    helloController.getHelloWorldPage(req, res);

    expect(helloModelStub.calledOnce).to.be.true;
    expect(res.render.calledOnce).to.be.true;
    expect(res.render.calledWith('hello', { message: alternateMessage })).to.be.true;
  });
});
