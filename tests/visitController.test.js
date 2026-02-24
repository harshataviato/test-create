import request from 'supertest';
import { createTestApp } from './helper.js';
import { sequelize, Owner, Pet, PetType, Visit } from '../models/index.js';

const app = createTestApp();

describe('Visit Controller', () => {
    let owner, pet, type;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        owner = await Owner.create({ firstName: 'V', lastName: 'O', address: 'A', city: 'C', telephone: '1234567890' });
        type = await PetType.create({ name: 'Dog' });
        pet = await Pet.create({ name: 'Rex', birthDate: '2019-01-01', ownerId: owner.id, typeId: type.id });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    test('GET /owners/:id/pets/:id/visits/new should render form', async () => {
        // Create existing visit to check if displayed
        await Visit.create({ date: '2020-01-01', description: 'Checkup', petId: pet.id });

        const res = await request(app).get(`/owners/${owner.id}/pets/${pet.id}/visits/new`);
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('New Visit');
        expect(res.text).toContain('Rex');
        expect(res.text).toContain('Checkup'); // Previous visits table
    });

    test('POST /owners/:id/pets/:id/visits/new should create visit', async () => {
        const res = await request(app).post(`/owners/${owner.id}/pets/${pet.id}/visits/new`).send({
            date: '2023-10-10',
            description: 'Vaccination'
        });
        expect(res.statusCode).toBe(302);
        
        const visit = await Visit.findOne({ where: { description: 'Vaccination' }});
        expect(visit).toBeDefined();
        expect(visit.petId).toBe(pet.id);
    });

    test('POST should fail validation on missing description', async () => {
        const res = await request(app).post(`/owners/${owner.id}/pets/${pet.id}/visits/new`).send({
            date: '2023-10-10',
            description: ''
        });
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Description is required');
    });
});
