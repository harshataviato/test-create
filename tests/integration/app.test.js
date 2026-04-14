/**
 * @module AppIntegrationTests
 * @description Integration tests for the main application (app.js) and its routes.
 * These tests use Supertest to simulate HTTP requests and verify the server's responses,
 * including correct routing, status codes, and content.
 */

// Import Supertest for making HTTP requests to the Express app
const request = require('supertest');
// Import the Express application instance from app.js
// We use a different variable name (serverApp) to avoid confusion with 'app' from Supertest's request(app)
const serverApp = require('../../app'); // This imports the Express app instance, not the listen() method.

describe('Express App Integration Tests', () => {
  let server;
  let originalConsoleLog;

  // Before all tests, start the server explicitly if needed for certain scenarios
  // However, Supertest usually manages its own server instance.
  beforeAll(() => {
    // Suppress console logs from app.js during tests
    originalConsoleLog = console.log;
    console.log = jest.fn();
    // No explicit server.listen() here as Supertest handles it for each request.
    // If the app had external database connections or specific global setup,
    // that would go here.
  });

  // After all tests, clean up
  afterAll((done) => {
    // Restore console.log
    console.log = originalConsoleLog;
    // Supertest closes its internal server automatically.
    // If we had a manually created server instance (e.g., app.listen()), we'd close it here.
    done();
  });

  /**
   * Test case for the root route ("/").
   * Verifies that a GET request to "/" returns a 200 OK status
   * and contains the "Hello world!" message in its HTML response.
   */
  test('GET / should return 200 OK with "Hello world!" in the HTML', async () => {
    const response = await request(serverApp).get('/');

    // Assert HTTP status code is 200
    expect(response.statusCode).toBe(200);
    // Assert Content-Type header is HTML
    expect(response.headers['content-type']).toMatch(/text\/html/);
    // Assert the response body contains the expected message
    expect(response.text).toContain('Hello world!');
    // Assert the response body contains the expected title
    expect(response.text).toContain('<title>Hello World App</title>');
  });

  /**
   * Test case for a non-existent route (404 Not Found).
   * Verifies that a GET request to an undefined route returns a 404 Not Found status
   * and the custom 404 error message.
   */
  test('GET /nonexistent-route should return 404 Not Found with custom message', async () => {
    const response = await request(serverApp).get('/nonexistent-route');

    // Assert HTTP status code is 404
    expect(response.statusCode).toBe(404);
    // Assert Content-Type header is HTML (as res.send sends HTML string)
    expect(response.headers['content-type']).toMatch(/text\/html/);
    // Assert the response body contains the custom 404 message
    expect(response.text).toContain('<h1>404</h1><p>Sorry, that route doesn\'t exist.</p>');
  });

  /**
   * Test case to ensure the root route correctly renders the EJS view.
   * This is implicitly covered by checking the content, but explicitly checking for
   * EJS-specific output (like the <h1> tag structure) can add robustness.
   */
  test('GET / should render the index.ejs template with correct structure', async () => {
    const response = await request(serverApp).get('/');

    expect(response.statusCode).toBe(200);
    // Check for the specific HTML structure from index.ejs
    expect(response.text).toContain('<div class="container">');
    expect(response.text).toContain('<h1>Hello world!</h1>');
    expect(response.text).toContain('</body>');
    expect(response.text).toContain('</html>');
  });

  /**
   * Test case for another non-existent route to ensure consistency of 404 handler.
   */
  test('GET /api/v1/users should also return 404', async () => {
    const response = await request(serverApp).get('/api/v1/users');

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("Sorry, that route doesn't exist.");
  });
});
