/**
 * @file test/static.test.js
 * @description Automated tests for static file serving.
 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const { expect } = require('chai');
const app = require('../app'); // Your Express app
const { sequelize } = require('../models');

describe('Static File Serving', () => {
  let server;

  before(async () => {
    server = app.listen(0); // Start the server on a random port for supertest
    // No specific database setup needed for static file tests, but ensure app starts.
  });

  after(async () => {
    await server.close();
    await sequelize.close(); // Close DB connection after all tests
  });

  it('GET /resources/css/petclinic.css should serve the CSS file', async () => {
    const res = await request(app).get('/resources/css/petclinic.css');
    expect(res.statusCode).to.equal(200);
    expect(res.headers['content-type']).to.include('text/css');
    expect(res.text).to.include('body {'); // Check for content that typically exists in the CSS file
    expect(res.text).to.include('--bs-body-font-family'); // Check for Bootstrap CSS variables
  });

  it('GET /nonexistent-static-file.txt should return 404', async () => {
    const res = await request(app).get('/nonexistent-static-file.txt');
    expect(res.statusCode).to.equal(404);
  });
});

