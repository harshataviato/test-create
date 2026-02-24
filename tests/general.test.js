import request from 'supertest';
import { createTestApp } from './helper.js';
import { sequelize } from '../models/index.js';

const app = createTestApp();

describe('General Routes', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });
    
    afterAll(async () => {
        await sequelize.close();
    });

    test('GET / should render welcome page', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Welcome');
    });

    test('GET /oups should trigger error handler', async () => {
        // Since the controller deliberately throws an error, 
        // the global error handler catches it and renders the error page with status 500
        const res = await request(app).get('/oups');
        expect(res.statusCode).toBe(500);
        expect(res.text).toContain('Something happened');
        expect(res.text).toContain('Expected: controller used to showcase');
    });

    test('GET /unknown-route should render 404', async () => {
        const res = await request(app).get('/somewhere-over-the-rainbow');
        expect(res.statusCode).toBe(404);
        expect(res.text).toContain('The requested page was not found');
    });
});
