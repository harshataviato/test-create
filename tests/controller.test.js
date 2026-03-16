const { expect } = require('chai');
const sinon = require('sinon');
const HelloController = require('../controllers/helloController');
const MessageModel = require('../models/messageModel');

describe('HelloController Unit Tests', () => {
  let req, res, consoleSpy;

  beforeEach(() => {
    // Mocking Express Request and Response objects
    req = {};
    res = {
      render: sinon.spy(),
      status: sinon.stub().returns({
        send: sinon.spy()
      })
    };
    // Spy on console.log to verify internal logging logic
    consoleSpy = sinon.spy(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  /**
   * Test Case: Index method success
   * Scenario: Normal execution of controller index
   * Expected: Calls MessageModel, logs output, and renders 'index' with data
   */
  it('should fetch the message and render the index view', () => {
    HelloController.index(req, res);

    // Verify model was called (indirectly via result check)
    const expectedMessage = "Hello world!";
    
    // Verify console logging (as per implementation requirements)
    expect(consoleSpy.calledWith(expectedMessage)).to.be.true;

    // Verify view rendering
    expect(res.render.calledOnce).to.be.true;
    expect(res.render.firstCall.args[0]).to.equal('index');
    expect(res.render.firstCall.args[1]).to.have.property('message', expectedMessage);
  });

  /**
   * Test Case: Error Handling logic
   * Scenario: Simulate an error in the Model
   * Expected: Returns a 500 status code
   */
  it('should return 500 error if MessageModel fails', () => {
    // Stub the model to throw an error
    sinon.stub(MessageModel, 'getGreeting').throws(new Error('Database Error'));

    HelloController.index(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.status().send.calledWith('Internal Server Error')).to.be.true;
  });
});
