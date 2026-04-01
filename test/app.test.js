/**
 * @file Integration tests for the main application (app.js) setup.
 * Covers static file serving and global error handling middleware.
 */

const request = require('supertest');
const { expect } = require('chai');
const app = require('../app'); // The Express app instance
const mongoose = require('mongoose');
const { disconnectDB } = require('../config/db'); // For specific test cases

describe('App General Functionality Tests', () => {
  // No specific database setup needed for these tests,
  // but beforeEach in setup.js will still clear Product collection.

  describe('Static File Serving', () => {
    it('should serve the public/css/style.css file', async () => {
      const res = await request(app).get('/css/style.css');
      expect(res.status).to.equal(200);
      expect(res.header['content-type']).to.include('text/css');
      expect(res.text).to.include('body {'); // Check for content from style.css
      expect(res.text).to.include('font-family: Arial, sans-serif;');
    });

    it('should serve the public/js/main.js file', async () => {
      const res = await request(app).get('/js/main.js');
      expect(res.status).to.equal(200);
      expect(res.header['content-type']).to.include('application/javascript');
      expect(res.text).to.include("console.log('Product Management App loaded!');"); // Check for content from main.js
    });

    it('should return 404 for a non-existent static file', async () => {
      const res = await request(app).get('/css/nonexistent.css');
      expect(res.status).to.equal(404);
    });
  });

  describe('Error Handling Middleware', () => {
    it('should handle internal server errors (500) and render error page', async () => {
      // Simulate an error by creating a temporary route that throws an error
      const errorMessage = 'Simulated internal server error for testing';
      app.get('/test-error', (req, res, next) => {
        next(new Error(errorMessage)); // Pass an error to the error handling middleware
      });

      const res = await request(app).get('/test-error');

      expect(res.status).to.equal(500);
      expect(res.text).to.include('Server Error'); // Title from the error.ejs
      expect(res.text).to.include(errorMessage); // Message from the error object
      expect(res.text).to.include('Something went wrong!'); // Generic message from controller
      expect(res.text).to.include('Go to Home'); // Buttons from error page
      expect(res.text).to.include('View Products');
      // Clean up the temporary route after the test
      app._router.stack.pop(); // Remove the last added route handler
    });

    it('should return a 404 for undefined routes', async () => {
      const res = await request(app).get('/non-existent-route');
      // Express default 404 handler runs before our 500 error handler for simple 404s
      expect(res.status).to.equal(404);
      // The default Express 404 doesn't render our custom error.ejs directly,
      // but if an unhandled route falls through, it can sometimes be caught by generic error handlers.
      // In this app, a simple 404 is handled by Express before our custom error middleware for 500s.
      // We'll primarily test that our 500 handler works for explicit errors passed via next(err).
    });
  });
});
