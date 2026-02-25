/**
 * @file test/controllers/systemController.test.js
 * @description Automated tests for systemController routes and error handling.
 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app'); // Your Express app
const { sequelize } = require('../../models');
const { resetAndSeedDatabase } = require('../helpers');

describe('SystemController', () => {
  let server;

  before(async () => {
    server = app.listen(0); // Start the server on a random port for supertest
    await resetAndSeedDatabase(); // Ensure DB is clean and seeded
  });

  after(async () => {
    await server.close();
    await sequelize.close(); // Close DB connection after all tests
  });

  describe('Welcome Page', () => {
    it('GET / should render the welcome page', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Welcome');
      expect(res.text).to.include('Find Owners'); // Link text
      expect(res.text).to.include('Display Veterinarians'); // Link text
    });
  });

  describe('Error Handling', () => {
    it('GET /oups should trigger an exception and display the error page', async () => {
      const res = await request(app).get('/oups');
      expect(res.statusCode).to.equal(500); // Expect a 500 status code
      expect(res.text).to.include('Error Page');
      expect(res.text).to.include('Something bad happened...');
      expect(res.text).to.include('Expected: controller used to showcase what happens when an exception is thrown');
    });

    it('GET /non-existent-route should return a 404 error page', async () => {
      const res = await request(app).get('/non-existent-route');
      expect(res.statusCode).to.equal(404); // Expect a 404 status code
      expect(res.text).to.include('Error Page');
      expect(res.text).to.include('Resource Not Found');
      expect(res.text).to.include('The page you requested could not be found.');
    });
  });

  describe('i18n Middleware Integration', () => {
    it('should display welcome message in default language (English)', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Welcome');
      expect(res.text).to.include('Find Owners');
    });

    it('should switch welcome message to Spanish via query parameter', async () => {
      const res = await request(app).get('/?lang=es');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Bienvenidos'); // Spanish translation
      expect(res.text).to.include('Buscar Propietarios'); // Spanish translation
    });

    it('should display error message in Spanish when an exception is triggered with lang=es', async () => {
      const res = await request(app).get('/oups?lang=es');
      expect(res.statusCode).to.equal(500);
      expect(res.text).to.include('Página de Error'); // Spanish error page title
      expect(res.text).to.include('Algo malo pasó...'); // Spanish error message
    });
  });
});

