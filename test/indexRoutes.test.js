/**
 * @file Integration tests for the index routes (root path) using Supertest.
 * Verifies that the home page renders correctly.
 */

const request = require('supertest');
const { expect } = require('chai');
const app = require('../app'); // The Express app instance

describe('Index Routes Integration Tests', () => {
  // No specific database setup needed for these basic routes,
  // but beforeEach in setup.js will still clear Product collection.

  describe('GET /', () => {
    it('should display the home page with a welcome message', async () => {
      const res = await request(app).get('/');
      expect(res.status).to.equal(200);
      expect(res.text).to.include('Welcome to Product Management');
      expect(res.text).to.include('View All Products');
      expect(res.text).to.include('Add New Product');
    });

    it('should use the layout.ejs for the home page', async () => {
      const res = await request(app).get('/');
      expect(res.status).to.equal(200);
      expect(res.text).to.include('<title>Welcome to Product Management</title>'); // Title from layout
      expect(res.text).to.include('<footer>'); // Footer from layout
      expect(res.text).to.include('<header>'); // Header from layout
    });
  });
});
