/**
 * @module test/routes/errorRoutes
 * @description Tests for the errorRoutes.
 */

// `request` is a global supertest instance from test/setup.js
// `expect` is a global chai.expect instance from test/setup.js

describe('Error Routes', () => {
  it('GET /oups should trigger a 500 error and render the error page', async () => {
    const res = await request.get('/oups');

    expect(res.status).to.equal(500);
    expect(res.text).to.include('Error 500');
    expect(res.text).to.include('Something unexpected happened!');
    expect(res.text).to.include('Go Home');
  });

  it('GET /non-existent-route should return a 404 error and render the error page', async () => {
    const res = await request.get('/non-existent-route');

    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include('The page you are looking for does not exist.');
    expect(res.text).to.include('Go Home');
  });
});

