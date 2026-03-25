/**
 * @module appTests
 * @description
 * Integration tests for the main Express application, focusing on route handling.
 * Uses Supertest to simulate HTTP requests and assert responses.
 */

const request = require('supertest'); // Import supertest for making HTTP requests
const app = require('./app');         // Import the Express application instance

// Define a test suite for the main application routes
describe('App Routes', () => {
  // --- Root Path Test ---
  /**
   * Test case: Verifies that the root path ('/') returns status 200 and
   * contains the "Hello world!" message in the HTML response.
   */
  test('GET / should return 200 and "Hello world!" in HTML', async () => {
    // Use supertest to make a GET request to the root path
    const response = await request(app).get('/');

    // Assert that the HTTP status code is 200 (OK)
    expect(response.statusCode).toBe(200);

    // Assert that the Content-Type header indicates HTML
    expect(response.headers['content-type']).toMatch(/text\/html/);

    // Assert that the response body contains the expected "Hello world!" message
    // This verifies that the EJS template was rendered correctly with the message from the model.
    expect(response.text).toContain('<h1>Hello world!</h1>');
    expect(response.text).toContain('<title>Hello World Node.js</title>');
  });

  // --- Non-existent Path Test (Failure Scenario) ---
  /**
   * Test case: Verifies that a request to a non-existent path returns a 404 status.
   * This confirms default Express behavior for unhandled routes.
   */
  test('GET /nonexistent-route should return 404', async () => {
    const response = await request(app).get('/nonexistent-route');

    // Assert that the HTTP status code is 404 (Not Found)
    expect(response.statusCode).toBe(404);
  });
});

// Since `app.listen` is called directly in app.js, Jest might report open handles.
// The ` --detectOpenHandles --forceExit` flags in package.json help manage this,
// but for explicit shutdown in tests, one might typically store the server instance
// and call `server.close()` in an `afterAll` hook if the server was started
// specifically for the tests. Here, `supertest` handles much of the lifecycle
// for testing routes against a running Express app instance.

// To prevent Jest from hanging due to the `app.listen` call in app.js,
// we ensure `process.exit()` is called or Jest's `--forceExit` option is used.
// For a cleaner test environment, in a larger application, `app.listen`
// would typically be moved to a separate `server.js` file, and `app` would
// be exported without listening, allowing tests to import `app` directly
// and `supertest` to handle listening internally or the tests to explicitly
// start/stop the server. For this simple app, `--forceExit` is pragmatic.
