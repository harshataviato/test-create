const helloController = require('../controllers/helloController');
const MessageModel = require('../models/messageModel');

/**
 * Unit tests for helloController
 */
describe('helloController', () => {
  let req, res, next;

  beforeEach(() => {
    // Mocking Express Request and Response objects
    req = {};
    res = {
      render: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    // Spy on console.log to verify it's called as per requirements
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('index should call MessageModel.getGreeting and render the index view', () => {
    const greeting = "Hello world!";
    
    helloController.index(req, res);

    // Verify Model interaction
    expect(res.render).toHaveBeenCalledWith('index', { message: greeting });
    // Verify Console Logging (original Java functionality requirement)
    expect(console.log).toHaveBeenCalledWith(greeting);
  });

  test('index should return 500 error if Model fails', () => {
    // Force the model to throw an error
    const spy = jest.spyOn(MessageModel, 'getGreeting').mockImplementation(() => {
      throw new Error('Database Error');
    });

    helloController.index(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Internal Server Error");

    spy.mockRestore();
  });
});
