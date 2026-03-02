const request = require('supertest');
const { expect } = require('chai');
const createApp = require('../utils/appFactory');
const { resetDb, seedBasicData } = require('../utils/dbHelper');
const { Owner } = require('../../models');

describe('Owner Routes & Controller', () => {
    let app;

    before(async () => {
        app = createApp();
    });

    beforeEach(async () => {
        await resetDb();
        await seedBasicData();
    });

    describe('GET /owners/find', () => {
        it('should render the find owners page', async () => {
            const res = await request(app).get('/owners/find');
            expect(res.status).to.equal(200);
            expect(res.text).to.include('Find Owners');
        });
    });

    describe('POST /owners/new (Creation)', () => {
        it('should create a new owner and redirect on success', async () => {
            const newOwner = {
                firstName: 'John',
                lastName: 'Doe',
                address: '123 Test St',
                city: 'TestCity',
                telephone: '1234567890'
            };

            const res = await request(app)
                .post('/owners/new')
                .send(newOwner);

            expect(res.status).to.equal(302); // Redirect
            
            const savedOwner = await Owner.findOne({ where: { lastName: 'Doe' } });
            expect(savedOwner).to.exist;
            expect(savedOwner.city).to.equal('TestCity');
            expect(res.header['location']).to.include(`/owners/${savedOwner.id}`);
        });

        it('should fail validation when fields are empty', async () => {
            const res = await request(app)
                .post('/owners/new')
                .send({
                    firstName: '', // Invalid
                    lastName: 'Doe',
                    address: '',
                    city: 'City',
                    telephone: '123' // Invalid length
                });

            expect(res.status).to.equal(200); // Renders form again
            expect(res.text).to.include('is required'); // Error message from express-validator
            expect(res.text).to.include('Telephone must be a 10-digit number');
            
            const count = await Owner.count();
            expect(count).to.equal(0);
        });
    });

    describe('GET /owners (Search)', () => {
        beforeEach(async () => {
            await Owner.bulkCreate([
                { firstName: 'Alice', lastName: 'Smith', address: 'A', city: 'C', telephone: '1234567890' },
                { firstName: 'Bob', lastName: 'Smith', address: 'B', city: 'C', telephone: '1234567890' },
                { firstName: 'Charlie', lastName: 'Brown', address: 'D', city: 'C', telephone: '1234567890' }
            ]);
        });

        it('should list multiple owners if multiple found', async () => {
            const res = await request(app).get('/owners').query({ lastName: 'Smith' });
            expect(res.status).to.equal(200);
            expect(res.text).to.include('Alice Smith');
            expect(res.text).to.include('Bob Smith');
            expect(res.text).to.not.include('Charlie Brown');
        });

        it('should redirect to details if exactly one owner found', async () => {
            const res = await request(app).get('/owners').query({ lastName: 'Brown' });
            expect(res.status).to.equal(302);
            expect(res.header['location']).to.match(/\/owners\/\d+/);
        });

        it('should show error if no owners found', async () => {
            const res = await request(app).get('/owners').query({ lastName: 'Zoro' });
            expect(res.status).to.equal(200);
            expect(res.text).to.include('has not been found');
        });
    });

    describe('GET /owners/:id', () => {
        it('should display owner details', async () => {
            const owner = await Owner.create({ firstName: 'Jane', lastName: 'Doe', address: 'X', city: 'Y', telephone: '1234567890' });
            
            const res = await request(app).get(`/owners/${owner.id}`);
            expect(res.status).to.equal(200);
            expect(res.text).to.include('Jane Doe');
            expect(res.text).to.include('Owner Information');
        });

        it('should handle 500/error if owner does not exist (handled by next(err))', async () => {
            // Note: The controller logic throws "Owner not found" which hits the error middleware
            const res = await request(app).get('/owners/99999');
            expect(res.status).to.equal(500);
            expect(res.text).to.include('Owner not found');
        });
    });

    describe('POST /owners/:id/edit', () => {
        it('should update owner details', async () => {
            const owner = await Owner.create({ firstName: 'Old', lastName: 'Name', address: 'X', city: 'Y', telephone: '1234567890' });
            
            const res = await request(app)
                .post(`/owners/${owner.id}/edit`)
                .send({
                    firstName: 'New',
                    lastName: 'Name',
                    address: 'X',
                    city: 'Y',
                    telephone: '1234567890'
                });

            expect(res.status).to.equal(302);
            const updated = await Owner.findByPk(owner.id);
            expect(updated.firstName).to.equal('New');
        });
    });
});
