const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');

describe('Application Integration Tests', () => {
  
  /**
   * Setup/Teardown:
   * In a real DB scenario, we would run migrations/seed here.
   * Since this is a static message app, we ensure the app instance is clean.
   */
  before(async () => {
    // Placeholder for DB setup: await db.connect('test_db');
  });

  /**
   * Test Case: GET / (Success)
   * Scenario: User visits the homepage
   * Expected: 200 OK, HTML content with "Hello world!"
   */
  it('should respond with 200 OK and render the correct HTML content', async () => {
    const response = await request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200);

    // Verify the presence of the message in the rendered HTML
    expect(response.text).to.contain('<h1>Hello world!</h1>');
    expect(response.text).to.contain('This was rendered using the MVC pattern');
  });

  /**
   * Test Case: 404 Not Found
   * Scenario: User visits a non-existent route
   * Expected: 404 status
   */
  it('should return 404 for undefined routes', async () => {
    await request(app)
      .get('/non-existent-route')
      .expect(404);
  });
});
