const request = require('supertest');
const { expect } = require('chai');
const createApp = require('../utils/appFactory');

describe('General Routes', () => {
    let app;

    before(() => {
        app = createApp();
    });

    it('GET / should render welcome page', async () => {
        const res = await request(app).get('/');
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Welcome');
    });

    it('GET /oups should trigger error handling', async () => {
        const res = await request(app).get('/oups');
        expect(res.status).to.equal(500);
        expect(res.text).to.include('Something happened');
        expect(res.text).to.include('Expected: controller used to showcase');
    });

    it('GET /unknown-route should return 404', async () => {
        const res = await request(app).get('/this-path-does-not-exist');
        expect(res.status).to.equal(404);
        expect(res.text).to.include('The requested page was not found');
    });
});
