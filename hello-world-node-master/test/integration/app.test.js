/**
 * @file app.test.js
 * @description Integration tests for the main Express application.
 *              Verifies that routes, controllers, models, and views work together correctly.
 *              Uses supertest to make HTTP requests to the running Express app.
 */

// Import assertion library
const { expect } = require('chai');
// Import supertest for making HTTP requests
const request = require('supertest');
// Import the main application file
const app = require('../../app');

// We need to keep a reference to the server instance started by app.listen
// for cases where we might need to close it manually, although supertest often handles this.
// For this simple app, we directly export `app` and supertest will manage it.
// However, if `app.listen` was inside `app.js` and not exported, we'd need to mock it.
// The current `app.js` starts the server when required. For testing, it's better to export
// the `app` instance itself and let the test runner start/stop it as needed for testing,
// or import the file *before* `app.listen` runs for proper control.
// The current `app.js` design starts the server immediately, which can cause issues
// when requiring it in tests if port conflicts or other side effects occur.
// To mitigate this, we'll ensure `app` itself (the express instance) is used by supertest,
// and the server start/stop is handled by supertest.
// A more robust setup would export `app` *without* calling `listen()` in `app.js`,
// and have a separate `server.js` or `bin/www` file that calls `app.listen()`.
// For this exercise, we will assume `request(app)` will correctly manage the server lifecycle for tests.


describe('Application Integration Tests', () => {
  // No explicit before/after hooks for server start/stop are strictly needed with `supertest(app)`
  // as it manages the server lifecycle internally for each request.
  // However, for more complex apps with database connections, you'd have global hooks here.

  /**
   * Test case: Verify the root route ('/') returns 200 OK and the expected "Hello world!" content.
   */
  it('should return 200 OK and render "Hello world!" on the root route ("/")', (done) => {
    request(app)
      .get('/') // Make a GET request to the root path
      .expect(200) // Expect an HTTP status code of 200 OK
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response body is a string
        expect(res.text).to.be.a('string');
        // Assert that the response body contains the main heading text
        expect(res.text).to.include('<h1>Hello world!</h1>');
        // Assert that the response body contains the paragraph text from the EJS template
        expect(res.text).to.include('<p>This is a simple Node.js application running with Express and EJS.</p>');
        // Assert that the response body contains the correct page title
        expect(res.text).to.include('<title>Hello World Node.js</title>');

        done(); // Signal that the asynchronous test is complete
      });
  });

  /**
   * Test case: Verify that requesting a non-existent route returns 404 (or default Express behavior).
   * Note: The current app doesn't have a custom 404 handler, so Express's default
   * "Cannot GET /nonexistent" behavior is expected, which usually results in 404.
   */
  it('should return 404 for a non-existent route', (done) => {
    request(app)
      .get('/nonexistent-route') // Make a GET request to a path that is not defined
      .expect(404) // Expect an HTTP status code of 404 Not Found
      .end((err, res) => {
        if (err) return done(err);
        // Optionally, check for specific content if Express provides a default 404 page
        // For default Express, it might just return "Cannot GET /nonexistent-route"
        expect(res.text).to.include('Cannot GET /nonexistent-route');
        done();
      });
  });

  /**
   * Test case: Verify that requesting a non-existent static file returns 404.
   * This covers the `app.use(express.static(...))` middleware.
   */
  it('should return 404 for a non-existent static file', (done) => {
    request(app)
      .get('/css/nonexistent.css') // Request a static file that doesn't exist
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.include('Cannot GET /css/nonexistent.css');
        done();
      });
  });

});
