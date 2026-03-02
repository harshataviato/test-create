const request = require('supertest');
const { expect } = require('chai');
const createApp = require('../utils/appFactory');
const { resetDb, seedBasicData } = require('../utils/dbHelper');
const { Owner, Pet, PetType, Visit } = require('../../models');

describe('Visit Routes & Controller', () => {
    let app;
    let owner;
    let pet;

    before(async () => {
        app = createApp();
    });

    beforeEach(async () => {
        await resetDb();
        await seedBasicData();
        owner = await Owner.create({ 
            firstName: 'John', lastName: 'Doe', 
            address: '123 St', city: 'City', telephone: '1234567890' 
        });
        const type = await PetType.findOne({ where: { name: 'cat' }});
        pet = await Pet.create({ 
            name: 'Kitty', 
            birthDate: '2020-01-01', 
            type_id: type.id, 
            owner_id: owner.id 
        });
    });

    describe('GET /owners/*/pets/*/visits/new', () => {
        it('should render the new visit form', async () => {
            const res = await request(app).get(`/owners/${owner.id}/pets/${pet.id}/visits/new`);
            expect(res.status).to.equal(200);
            expect(res.text).to.include('New Visit');
            expect(res.text).to.include('Kitty'); // Pet Name
        });
    });

    describe('POST /owners/*/pets/*/visits/new', () => {
        it('should create a new visit', async () => {
            const res = await request(app)
                .post(`/owners/${owner.id}/pets/${pet.id}/visits/new`)
                .send({
                    date: '2023-10-25',
                    description: 'Vaccination'
                });

            expect(res.status).to.equal(302);
            expect(res.header['location']).to.equal(`/owners/${owner.id}`);

            const visit = await Visit.findOne({ where: { description: 'Vaccination' } });
            expect(visit).to.exist;
            expect(visit.pet_id).to.equal(pet.id);
        });

        it('should validate empty description', async () => {
            const res = await request(app)
                .post(`/owners/${owner.id}/pets/${pet.id}/visits/new`)
                .send({
                    date: '2023-10-25',
                    description: ''
                });

            expect(res.status).to.equal(200);
            expect(res.text).to.include('is required');
        });
    });
});
