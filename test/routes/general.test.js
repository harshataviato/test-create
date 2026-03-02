const request = require('supertest');
const { expect } = require('chai');
const { app, sequelize, db } = require('../utils/testApp');

describe('Integration Tests: General & Vets', () => {

    before(async () => {
        await sequelize.sync({ force: true });
        const spec = await db.Specialty.create({ name: 'surgery' });
        const vet = await db.Vet.create({ firstName: 'James', lastName: 'Herriot' });
        await vet.addSpecialty(spec);
    });

    describe('General Pages', () => {
        it('GET / should render welcome page', async () => {
            const res = await request(app).get('/');
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('Welcome');
        });

        it('GET /oups should trigger error page', async () => {
            const res = await request(app).get('/oups');
            expect(res.status).to.equal(500);
            expect(res.text).to.contain('An unexpected error occurred');
        });
    });

    describe('Vet Controller', () => {
        it('GET /vets.html should render html list', async () => {
            const res = await request(app).get('/vets.html');
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('James Herriot');
            expect(res.text).to.contain('surgery'); // Specialty
        });

        it('GET /vets should return JSON', async () => {
            const res = await request(app).get('/vets');
            expect(res.status).to.equal(200);
            expect(res.headers['content-type']).to.contain('json');
            expect(res.body.vetList).to.be.an('array');
            expect(res.body.vetList[0].lastName).to.equal('Herriot');
        });
    });
});
