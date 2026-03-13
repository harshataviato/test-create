const request = require('supertest');
const express = require('express');
const path = require('path');
const helloController = require('../controllers/helloController');

/**
 * Integration tests for application routes
 */
describe('GET / Route Integration', () => {
  let app;

  beforeAll(() => {
    // Setup a fresh express instance for integration testing
    app = express();
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));
    app.get('/', helloController.index);
  });

  test('Should return 200 OK and render HTML with greeting', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
    
    // Check if the rendered output contains our business logic string
    expect(response.text).toContain('Hello world!');
    expect(response.text).toContain('This was rendered via the Node.js MVC pattern.');
  });

  test('Should handle 404 for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-path');
    expect(response.status).toBe(404);
  });
});
