const request = require('supertest');
const { expect } = require('chai');
const createApp = require('../utils/appFactory');
const { resetDb, seedBasicData } = require('../utils/dbHelper');
const { Owner, Pet, PetType } = require('../../models');

describe('Pet Routes & Controller', () => {
    let app;
    let owner;

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
    });

    describe('GET /owners/:ownerId/pets/new', () => {
        it('should render the add pet form', async () => {
            const res = await request(app).get(`/owners/${owner.id}/pets/new`);
            expect(res.status).to.equal(200);
            expect(res.text).to.include('New Pet');
            // Should contain options from PetType seed
            expect(res.text).to.include('cat');
            expect(res.text).to.include('dog');
        });
    });

    describe('POST /owners/:ownerId/pets/new', () => {
        it('should create a pet and associate with owner', async () => {
            const res = await request(app)
                .post(`/owners/${owner.id}/pets/new`)
                .send({
                    name: 'Fluffy',
                    birthDate: '2020-01-01',
                    type: 'cat'
                });

            expect(res.status).to.equal(302); // Redirect to owner details
            expect(res.header['location']).to.equal(`/owners/${owner.id}`);

            const pet = await Pet.findOne({ where: { name: 'Fluffy' }, include: ['type'] });
            expect(pet).to.exist;
            expect(pet.owner_id).to.equal(owner.id);
            expect(pet.type.name).to.equal('cat');
        });

        it('should fail validation on invalid date', async () => {
            const res = await request(app)
                .post(`/owners/${owner.id}/pets/new`)
                .send({
                    name: 'Fluffy',
                    birthDate: 'not-a-date',
                    type: 'cat'
                });
            
            expect(res.status).to.equal(200);
            expect(res.text).to.include('invalid date');
        });
    });

    describe('POST /owners/:ownerId/pets/:petId/edit', () => {
        it('should update an existing pet', async () => {
            const type = await PetType.findOne({ where: { name: 'dog' }});
            const pet = await Pet.create({ 
                name: 'Barky', 
                birthDate: '2019-01-01', 
                type_id: type.id, 
                owner_id: owner.id 
            });

            const res = await request(app)
                .post(`/owners/${owner.id}/pets/${pet.id}/edit`)
                .send({
                    name: 'Spot',
                    birthDate: '2019-01-01',
                    type: 'dog'
                });

            expect(res.status).to.equal(302);
            
            const updatedPet = await Pet.findByPk(pet.id);
            expect(updatedPet.name).to.equal('Spot');
        });
    });
});
