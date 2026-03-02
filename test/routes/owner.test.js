const request = require('supertest');
const { expect } = require('chai');
const { app, sequelize, db } = require('../utils/testApp');

describe('Integration Tests: Owner Controller', () => {

    before(async () => {
        await sequelize.sync({ force: true });
        // Seed Pet Types
        await db.PetType.create({ name: 'dog' });
        await db.PetType.create({ name: 'cat' });
    });

    describe('GET /owners/find', () => {
        it('should render the find owners form', async () => {
            const res = await request(app).get('/owners/find');
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('Find Owners');
        });
    });

    describe('POST /owners/new', () => {
        it('should create a new owner and redirect', async () => {
            const res = await request(app).post('/owners/new').send({
                firstName: 'George',
                lastName: 'Franklin',
                address: '110 W. Liberty St.',
                city: 'Madison',
                telephone: '6085551023'
            });
            expect(res.status).to.equal(302); // Redirect
            expect(res.header['location']).to.include('/owners/');
        });

        it('should fail validation and re-render form on bad input', async () => {
            const res = await request(app).post('/owners/new').send({
                firstName: '', // Invalid
                lastName: 'Franklin',
                address: 'Address',
                city: 'City',
                telephone: '123' // Invalid len
            });
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('First Name is required');
        });
    });

    describe('GET /owners (Search)', () => {
        before(async () => {
            // Ensure data exists
            await db.Owner.create({ firstName: 'Betty', lastName: 'Davis', address: 'Addr', city: 'City', telephone: '6085551749' });
            await db.Owner.create({ firstName: 'Harold', lastName: 'Davis', address: 'Addr', city: 'City', telephone: '6085551749' });
        });

        it('should redirect to owner details if only 1 match found', async () => {
            const res = await request(app).get('/owners').query({ lastName: 'Franklin' });
            expect(res.status).to.equal(302);
        });

        it('should list multiple owners if multiple matches found', async () => {
            const res = await request(app).get('/owners').query({ lastName: 'Davis' });
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('Betty Davis');
            expect(res.text).to.contain('Harold Davis');
        });

        it('should render form with error if no owners found', async () => {
            const res = await request(app).get('/owners').query({ lastName: 'Unknown' });
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('has not been found');
        });
    });

    describe('GET /owners/:id', () => {
        it('should show owner details', async () => {
            const owner = await db.Owner.findOne();
            const res = await request(app).get(`/owners/${owner.id}`);
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('Owner Information');
            expect(res.text).to.contain(owner.firstName);
        });

        it('should return 404 for non-existent owner', async () => {
            const res = await request(app).get('/owners/99999');
            expect(res.status).to.equal(404);
        });
    });

    describe('POST /owners/:id/edit', () => {
        it('should update owner details', async () => {
            const owner = await db.Owner.create({ firstName: 'Update', lastName: 'Me', address: 'A', city: 'C', telephone: '1234567890' });
            
            const res = await request(app).post(`/owners/${owner.id}/edit`).send({
                firstName: 'Updated',
                lastName: 'Me',
                address: 'New Address',
                city: 'C',
                telephone: '1234567890'
            });

            expect(res.status).to.equal(302);
            const updated = await db.Owner.findByPk(owner.id);
            expect(updated.firstName).to.equal('Updated');
            expect(updated.address).to.equal('New Address');
        });
    });
});
