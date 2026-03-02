const request = require('supertest');
const { expect } = require('chai');
const createApp = require('../utils/appFactory');
const { resetDb, seedBasicData } = require('../utils/dbHelper');

describe('Vet Routes & Controller', () => {
    let app;

    before(async () => {
        app = createApp();
    });

    beforeEach(async () => {
        await resetDb();
        await seedBasicData(); // Seeds 'Test Vet' with 'radiology'
    });

    describe('GET /vets.html', () => {
        it('should render list of vets', async () => {
            const res = await request(app).get('/vets.html');
            expect(res.status).to.equal(200);
            expect(res.text).to.include('Veterinarians');
            expect(res.text).to.include('Test Vet');
            expect(res.text).to.include('radiology');
        });
    });

    describe('GET /vets (JSON)', () => {
        it('should return JSON list of vets', async () => {
            const res = await request(app).get('/vets').set('Accept', 'application/json');
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('vetList');
            expect(res.body.vetList).to.be.an('array');
            expect(res.body.vetList[0].lastName).to.equal('Vet');
            expect(res.body.vetList[0].Specialties[0].name).to.equal('radiology');
        });
    });
});
