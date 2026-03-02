const request = require('supertest');
const { expect } = require('chai');
const { app, sequelize, db } = require('../utils/testApp');

describe('Integration Tests: Pet & Visit Controllers', () => {
    let owner;
    let typeDog;

    before(async () => {
        await sequelize.sync({ force: true });
        typeDog = await db.PetType.create({ name: 'dog' });
        owner = await db.Owner.create({ 
            firstName: 'Pet', lastName: 'Owner', 
            address: '123 St', city: 'City', telephone: '1234567890' 
        });
    });

    describe('Pet Operations', () => {
        it('GET /owners/:id/pets/new should render form', async () => {
            const res = await request(app).get(`/owners/${owner.id}/pets/new`);
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('New Pet');
        });

        it('POST /owners/:id/pets/new should create a pet', async () => {
            const res = await request(app).post(`/owners/${owner.id}/pets/new`).send({
                name: 'Buddy',
                birthDate: '2020-01-01',
                type: 'dog'
            });
            expect(res.status).to.equal(302);
            
            const pets = await db.Pet.findAll({ where: { ownerId: owner.id } });
            expect(pets).to.have.lengthOf(1);
            expect(pets[0].name).to.equal('Buddy');
        });

        it('POST /owners/:id/pets/new should reject duplicate pet name for same owner', async () => {
            // Try adding Buddy again
            const res = await request(app).post(`/owners/${owner.id}/pets/new`).send({
                name: 'Buddy',
                birthDate: '2021-01-01',
                type: 'dog'
            });
            expect(res.status).to.equal(200); // Re-renders form
            expect(res.text).to.contain('is already in use');
        });

        it('POST /owners/:id/pets/:petId/edit should update pet', async () => {
            const pet = await db.Pet.findOne({ where: { name: 'Buddy' }});
            const res = await request(app).post(`/owners/${owner.id}/pets/${pet.id}/edit`).send({
                name: 'BuddyUpdated',
                birthDate: '2020-01-01',
                type: 'dog'
            });
            expect(res.status).to.equal(302);
            
            await pet.reload();
            expect(pet.name).to.equal('BuddyUpdated');
        });
    });

    describe('Visit Operations', () => {
        let pet;

        before(async () => {
            pet = await db.Pet.findOne({ where: { ownerId: owner.id } });
        });

        it('GET /owners/*/pets/*/visits/new should render form', async () => {
            const res = await request(app).get(`/owners/${owner.id}/pets/${pet.id}/visits/new`);
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('New Visit');
        });

        it('POST /owners/*/pets/*/visits/new should add a visit', async () => {
            const res = await request(app).post(`/owners/${owner.id}/pets/${pet.id}/visits/new`).send({
                date: '2023-10-10',
                description: 'Vaccination'
            });
            expect(res.status).to.equal(302); // Redirects to owner details

            const visits = await db.Visit.findAll({ where: { petId: pet.id } });
            expect(visits).to.have.lengthOf(1);
            expect(visits[0].description).to.equal('Vaccination');
        });

        it('should fail if description is empty', async () => {
            const res = await request(app).post(`/owners/${owner.id}/pets/${pet.id}/visits/new`).send({
                date: '2023-10-10',
                description: ''
            });
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('Description is required');
        });
    });
});
