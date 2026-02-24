/**
 * General Routes and Error Handling Tests
 */
const request = require('supertest');
const app = require('../src/app');

describe('General Routes', () => {
  it('GET / should render welcome page', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Welcome');
    expect(res.text).toContain('pets.png');
  });

  it('GET /unknown-route should render 404', async () => {
    const res = await request(app).get('/unknown-route-123');
    expect(res.statusCode).toBe(404);
    expect(res.text).toContain('Page not found');
  });

  it('GET /oups should render error page', async () => {
    const res = await request(app).get('/oups');
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('Something happened');
    // The specific message from the thrown error
    expect(res.text).toContain('Expected: controller used to showcase what happens when an exception is thrown');
  });
});
