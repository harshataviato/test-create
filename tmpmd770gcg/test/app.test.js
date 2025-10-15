const request = require('supertest');
const app = require('../index'); // Import the Express app

describe('Express App Routes', () => {

  // Test case for the root path '/'
  it('should respond with "Hello, World!" on GET /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('Hello, World!');
  });

  // Test case for the health check path '/health'
  it('should respond with "OK" on GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('OK');
  });

  // Test case for an undefined route (404 Not Found)
  it('should respond with 404 for an unknown route', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.statusCode).toEqual(404);
  });
});
