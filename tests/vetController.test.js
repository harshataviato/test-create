import request from 'supertest';
import { createTestApp } from './helper.js';
import { sequelize, Vet, Specialty } from '../models/index.js';
import * as cheerio from 'cheerio';

const app = createTestApp();

describe('Vet Controller', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
        const radiology = await Specialty.create({ name: 'radiology' });
        const vet1 = await Vet.create({ firstName: 'James', lastName: 'Carter' });
        const vet2 = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
        await vet2.addSpecialty(radiology);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    test('GET /vets.html should render HTML list', async () => {
        const res = await request(app).get('/vets.html');
        expect(res.statusCode).toBe(200);
        expect(res.type).toContain('text/html');
        
        const $ = cheerio.load(res.text);
        expect($('table#vets tbody tr').length).toBe(2);
        expect(res.text).toContain('James Carter');
        expect(res.text).toContain('radiology');
    });

    test('GET /vets should render JSON', async () => {
        const res = await request(app).get('/vets');
        expect(res.statusCode).toBe(200);
        expect(res.type).toContain('application/json');
        expect(res.body.vetList).toHaveLength(2);
        expect(res.body.vetList[0].firstName).toBeDefined();
    });
});
