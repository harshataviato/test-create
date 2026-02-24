const request = require('supertest');
const { expect } = require('chai');
const { startServer, baseUrl } = require('../utils/test-server');

describe('Routes: System / Error Handling', () => {
  before(async () => {
    await startServer();
  });

  it('GET /unknown-route should return 404', async () => {
    const res = await request(baseUrl).get('/this-does-not-exist');
    expect(res.status).to.equal(404);
    expect(res.text).to.include('The requested page was not found');
  });

  it('GET /oups should trigger error handler and return 500', async () => {
    // We expect 500 because the route explicitly throws an Error
    const res = await request(baseUrl).get('/oups');
    expect(res.status).to.equal(500);
    expect(res.text).to.include('Something happened');
    expect(res.text).to.include('Expected: controller used to showcase');
  });
});
