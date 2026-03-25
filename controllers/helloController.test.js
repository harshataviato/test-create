/**
 * @module helloControllerTests
 * @description
 * Tests for the helloController, ensuring it correctly interacts with the MessageModel
 * and renders the 'index' view with the message.
 */

const helloController = require('./helloController'); // Import the helloController
const MessageModel = require('../models/messageModel'); // Import the MessageModel to mock it

// Mock the entire MessageModel module to control its behavior
jest.mock('../models/messageModel');

describe('helloController', () => {
  // Define mock request and response objects before each test
  let mockReq;
  let mockRes;
  let mockMessage;

  beforeEach(() => {
    // Reset mocks and define new mock objects for each test to ensure isolation
    mockMessage = 'Hello world from mock!'; // A distinct message for testing
    // Configure the mocked MessageModel's behavior
    MessageModel.getHelloWorldMessage.mockReturnValue(mockMessage);

    mockReq = {}; // Request object is simple for this controller

    mockRes = {
      render: jest.fn(), // Mock the render method to capture its calls
    };
  });

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  /**
   * Test case: Verifies that getHomePage calls MessageModel and renders the view correctly.
   */
  test('getHomePage should call MessageModel and render the index view with the message', () => {
    // Call the controller method
    helloController.getHomePage(mockReq, mockRes);

    // Assert that MessageModel.getHelloWorldMessage was called
    expect(MessageModel.getHelloWorldMessage).toHaveBeenCalledTimes(1);

    // Assert that res.render was called once
    expect(mockRes.render).toHaveBeenCalledTimes(1);

    // Assert that res.render was called with 'index' and an object containing the message
    expect(mockRes.render).toHaveBeenCalledWith('index', { message: mockMessage });
  });

  /**
   * Test case: Verifies that getHomePage handles the case where the message might change
   * (though it's hardcoded, this confirms flexibility if the model were to change).
   */
  test('getHomePage should render with a different message if model returns one', () => {
    const customMessage = 'Greetings from Jest!';
    MessageModel.getHelloWorldMessage.mockReturnValue(customMessage); // Override mock behavior

    helloController.getHomePage(mockReq, mockRes);

    expect(MessageModel.getHelloWorldMessage).toHaveBeenCalledTimes(1);
    expect(mockRes.render).toHaveBeenCalledWith('index', { message: customMessage });
  });
});

