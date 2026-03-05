const request = require('supertest');
const { expect } = require('chai');
// Use the express app instance
const app = require('../app'); 

describe('System Routes', () => {
  it('GET / should return 200 and welcome page', async () => {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    // EJS content check
    expect(res.text).to.contain('Welcome');
  });

  it('GET /oups should trigger the error handler (500)', async () => {
    const res = await request(app).get('/oups');
    expect(res.status).to.equal(500);
    expect(res.text).to.contain('Expected: controller used to showcase');
  });

  it('GET /non-existent should return 404 (or 500 via default handler)', async () => {
    const res = await request(app).get('/not-real');
    // Express returns 404 by default if not handled, but our app 
    // has an error handler. Standard Express 404 isn't caught by the (err, req, res) block
    // unless next(err) is called.
    expect(res.status).to.equal(404);
  });
});
