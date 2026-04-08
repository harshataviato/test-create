const request = require('supertest');
const { app, initializeDatabase } = require('../app');
const { sequelize } = require('../config/database');
const Product = require('../models/product')(sequelize); // Just to ensure model is loaded

describe('Application-Level Routes and Error Handling', () => {
  let server;

  // Before all tests, initialize the database (sync models)
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'sqlite::memory:';
    await initializeDatabase();
    server = app.listen(0); // Start the app on a random free port for supertest
  });

  // After all tests, close the server and database connection
  afterAll(async () => {
    await server.close();
    await sequelize.close();
  });

  // --- Root Redirect ---
  it('GET / should redirect to /products', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(302); // Redirect status code
    expect(res.headers.location).toEqual('/products');
  });

  // --- 404 Not Found Handling ---
  it('should return 404 for a non-existent route', async () => {
    const res = await request(app).get('/non-existent-route-123');
    expect(res.statusCode).toEqual(404);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('404 - Page Not Found');
    expect(res.text).toContain('The page you are looking for does not exist.');
  });

  // --- 500 Server Error Handling ---
  it('should return 500 for a route that throws an internal server error', async () => {
    // Temporarily add a route that throws an error to test the 500 handler
    app.get('/test-error', (req, res, next) => {
      next(new Error('Simulated server error'));
    });

    const res = await request(app).get('/test-error');
    expect(res.statusCode).toEqual(500);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('500 - Server Error');
    expect(res.text).toContain('Error Details: Simulated server error');

    // Remove the temporary route after the test
    app._router.stack = app._router.stack.filter(layer => layer.route && layer.route.path !== '/test-error');
  });
});
