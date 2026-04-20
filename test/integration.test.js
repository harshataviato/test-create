const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');

describe('API Integration Tests', () => {
  
  describe('GET /', () => {
    it('should return 200 OK and render HTML content', async () => {
      const response = await request(app)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200);

      expect(response.text).to.contain('Hello world!');
      expect(response.text).to.contain('This page was rendered using Express and EJS.');
    });
  });

  describe('GET /api/hello', () => {
    it('should return 200 OK and the correct JSON object', async () => {
      const response = await request(app)
        .get('/api/hello')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).to.have.property('message', 'Hello world!');
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/undefined-route')
        .expect(404);
    });
  });
});
