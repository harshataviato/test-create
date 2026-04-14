/**
 * @module MessageControllerUnitTests
 * @description Unit tests for the messageController.js module.
 * These tests focus on verifying the logic within the controller,
 * ensuring it correctly interacts with the model and renders the view.
 */

// Import the message controller to be tested
const messageController = require('../../controllers/messageController');

// Mock the message model dependency to isolate the controller's logic
// This prevents actual file system operations or external calls if the model were more complex.
jest.mock('../../models/messageModel', () => ({
  getHelloWorldMessage: jest.fn(), // Mock the getHelloWorldMessage function
}));

// Require the mocked module to access its mocked functions
const messageModel = require('../../models/messageModel');

describe('messageController', () => {
  let req; // Mock request object
  let res; // Mock response object
  let mockMessage; // Message to be returned by the mocked model

  // Setup before each test
  beforeEach(() => {
    // Reset all mocks before each test to ensure test isolation
    jest.clearAllMocks();

    mockMessage = "Hello world from mock!"; // Define a mock message

    // Configure the mock messageModel to return our mock message
    messageModel.getHelloWorldMessage.mockReturnValue(mockMessage);

    // Initialize mock Express request and response objects
    req = {}; // Request object is empty for this controller's logic
    res = {
      render: jest.fn(), // Mock the render method of the response object
    };
  });

  /**
   * Test case for the renderHelloWorld function.
   * It verifies that:
   * 1. The messageModel's getHelloWorldMessage is called.
   * 2. The response object's render method is called with the correct view name ('index').
   * 3. The render method is called with an object containing the message from the model.
   */
  test('renderHelloWorld should call messageModel.getHelloWorldMessage and render the "index" view with the message', () => {
    // Call the controller function
    messageController.renderHelloWorld(req, res);

    // Assert that messageModel.getHelloWorldMessage was called exactly once
    expect(messageModel.getHelloWorldMessage).toHaveBeenCalledTimes(1);

    // Assert that res.render was called exactly once
    expect(res.render).toHaveBeenCalledTimes(1);

    // Assert that res.render was called with 'index' as the view and an object containing the message
    expect(res.render).toHaveBeenCalledWith('index', { message: mockMessage });
  });

  /**
   * Edge case: What if the messageModel returns an empty string or null?
   * The controller should still render, passing whatever it gets.
   * This test ensures robustness for unexpected model outputs.
   */
  test('renderHelloWorld should render with an empty message if model returns one', () => {
    messageModel.getHelloWorldMessage.mockReturnValue(""); // Mock an empty message

    messageController.renderHelloWorld(req, res);

    expect(messageModel.getHelloWorldMessage).toHaveBeenCalledTimes(1);
    expect(res.render).toHaveBeenCalledTimes(1);
    expect(res.render).toHaveBeenCalledWith('index', { message: "" });
  });

  /**
   * Edge case: What if the messageModel returns a different message?
   * The controller should pass that message directly to the view.
   */
  test('renderHelloWorld should render with a custom message if model returns one', () => {
    const customMessage = "Another custom message!";
    messageModel.getHelloWorldMessage.mockReturnValue(customMessage);

    messageController.renderHelloWorld(req, res);

    expect(messageModel.getHelloWorldMessage).toHaveBeenCalledTimes(1);
    expect(res.render).toHaveBeenCalledTimes(1);
    expect(res.render).toHaveBeenCalledWith('index', { message: customMessage });
  });
});
