// test/integration/systemRoutes.test.js
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app'); // Import the main app instance

describe('System Routes', () => {
  describe('GET /', () => {
    it('should render the welcome page', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>Welcome</h2>'); // Check for specific content on the page
      expect(res.text).to.include('<title>PetClinic :: a Node.js Express demonstration</title>'); // Check title
    });
  });

  describe('GET /health', () => {
    it('should return 200 OK for health check', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.equal('OK');
    });
  });

  describe('GET /oups', () => {
    it('should trigger an error and render the error page with status 500', async () => {
      const res = await request(app).get('/oups');
      expect(res.statusCode).to.equal(500);
      expect(res.text).to.include('<h2>Something happened...</h2>'); // Check for specific error page content
      expect(res.text).to.include('An internal server error occurred.'); // Generic error message
      expect(res.text).to.include('Expected: controller used to showcase what happens when an exception is thrown'); // Specific error message
      expect(res.text).to.include('<h3>Stack Trace:</h3>'); // Stack trace should be visible in test env
    });
  });

  describe('GET /nonexistent-route', () => {
    it('should return 404 for a non-existent route', async () => {
      const res = await request(app).get('/nonexistent-route');
      expect(res.statusCode).to.equal(404);
      expect(res.text).to.include('<h2>Something happened...</h2>'); // Check for error page
      expect(res.text).to.include('The requested page was not found.'); // Specific 404 message
      // Stack trace might or might not be present depending on whether `err.stack` is passed to 404 handler
      // Currently, the global error handler handles all errors and renders it with a stack if NODE_ENV is dev/test.
    });
  });
});
