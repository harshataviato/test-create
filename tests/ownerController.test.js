import request from 'supertest';
import { createTestApp } from './helper.js';
import { sequelize, Owner, Pet } from '../models/index.js';
import * as cheerio from 'cheerio'; // Used to parse HTML responses

const app = createTestApp();

describe('Owner Controller', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
        // Seed some data
        await Owner.bulkCreate([
            { firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' },
            { firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' },
            { firstName: 'Eduardo', lastName: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763' }
        ]);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('GET /owners/find', () => {
        test('should render the find owners form', async () => {
            const res = await request(app).get('/owners/find');
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain('Find Owners');
        });
    });

    describe('GET /owners (Search)', () => {
        test('should redirect to owner details if exactly one match found', async () => {
            const res = await request(app).get('/owners').query({ lastName: 'Franklin' });
            expect(res.statusCode).toBe(302);
            // We assume ID 1 because it was inserted first
            expect(res.headers.location).toMatch(/\/owners\/\d+/);
        });

        test('should render list if multiple owners found', async () => {
            // Seed another Davis to ensure multiple results logic
            await Owner.create({ firstName: 'Harold', lastName: 'Davis', address: '123 St', city: 'City', telephone: '1112223333' });

            const res = await request(app).get('/owners').query({ lastName: 'Davis' });
            expect(res.statusCode).toBe(200);
            const $ = cheerio.load(res.text);
            expect($('table#owners tbody tr').length).toBeGreaterThanOrEqual(2);
        });

        test('should return all owners if query is empty', async () => {
            const res = await request(app).get('/owners').query({ lastName: '' });
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain('Eduardo');
            expect(res.text).toContain('George');
        });

        test('should render error if no owner found', async () => {
            const res = await request(app).get('/owners').query({ lastName: 'UnknownMan' });
            expect(res.statusCode).toBe(200); // Renders form again with error
            expect(res.text).toContain('has not been found');
        });
    });

    describe('GET /owners/:id', () => {
        test('should show owner details', async () => {
            const owner = await Owner.findOne();
            const res = await request(app).get(`/owners/${owner.id}`);
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain('Owner Information');
            expect(res.text).toContain(owner.firstName);
        });

        test('should render error for non-existent owner', async () => {
            const res = await request(app).get('/owners/99999');
            expect(res.statusCode).toBe(200); // Renders error page
            expect(res.text).toContain('Owner not found');
        });
    });

    describe('Create Owner', () => {
        test('GET /owners/new should render form', async () => {
            const res = await request(app).get('/owners/new');
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain('Add Owner');
        });

        test('POST /owners/new should create owner and redirect', async () => {
            const newOwner = {
                firstName: 'Test',
                lastName: 'User',
                address: '123 Logic St',
                city: 'Computer',
                telephone: '1234567890'
            };
            const res = await request(app).post('/owners/new').send(newOwner);
            expect(res.statusCode).toBe(302);
            
            const dbOwner = await Owner.findOne({ where: { lastName: 'User' }});
            expect(dbOwner).not.toBeNull();
        });

        test('POST /owners/new should fail validation with invalid data', async () => {
            const invalidOwner = {
                firstName: '', // Missing
                lastName: 'User',
                telephone: '123' // Too short
            };
            const res = await request(app).post('/owners/new').send(invalidOwner);
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain('First Name is required');
            expect(res.text).toContain('Telephone must be a 10-digit number');
        });
    });

    describe('Update Owner', () => {
        test('POST /owners/:id/edit should update details', async () => {
            const owner = await Owner.create({ firstName: 'Update', lastName: 'Me', address: 'Old', city: 'Town', telephone: '1234567890'});
            const res = await request(app).post(`/owners/${owner.id}/edit`).send({
                firstName: 'Updated',
                lastName: 'Me',
                address: 'New Address',
                city: 'New City',
                telephone: '1234567890'
            });
            expect(res.statusCode).toBe(302);
            const check = await Owner.findByPk(owner.id);
            expect(check.firstName).toBe('Updated');
            expect(check.address).toBe('New Address');
        });
    });
});
