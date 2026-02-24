const request = require('supertest');
const createApp = require('../helpers/appFactory');
const { sequelize } = require('../../models');

const app = createApp();

describe('Integration: General Routes', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('GET / should render welcome page', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Welcome');
  });

  it('GET /oups should trigger error handler', async () => {
    // Note: The /oups route throws an error deliberately.
    // The global error handler catches it and renders the error page.
    const res = await request(app).get('/oups');
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('Something happened...');
    expect(res.text).toContain('Expected: controller used to showcase');
  });

  it('GET /unknown-route should render 404', async () => {
    const res = await request(app).get('/this-path-does-not-exist');
    expect(res.statusCode).toBe(404);
    expect(res.text).toContain('Page Not Found');
  });
});
