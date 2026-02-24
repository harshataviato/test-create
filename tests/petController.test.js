import request from 'supertest';
import { createTestApp } from './helper.js';
import { sequelize, Owner, Pet, PetType } from '../models/index.js';

const app = createTestApp();

describe('Pet Controller', () => {
    let owner;
    let type;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        owner = await Owner.create({
            firstName: 'Pet', lastName: 'Owner', address: 'St', city: 'C', telephone: '1234567890'
        });
        type = await PetType.create({ name: 'Cat' });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('Create Pet', () => {
        test('GET /owners/:id/pets/new should render form', async () => {
            const res = await request(app).get(`/owners/${owner.id}/pets/new`);
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain('New Pet');
            expect(res.text).toContain('Cat'); // Check types populated
        });

        test('POST /owners/:id/pets/new should create pet', async () => {
            const res = await request(app).post(`/owners/${owner.id}/pets/new`).send({
                name: 'Kitty',
                birthDate: '2023-01-01',
                typeId: type.id
            });
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe(`/owners/${owner.id}`);

            const pet = await Pet.findOne({ where: { name: 'Kitty' }});
            expect(pet).toBeDefined();
        });

        test('POST /owners/:id/pets/new should validate input', async () => {
            const res = await request(app).post(`/owners/${owner.id}/pets/new`).send({
                name: '', // Empty name
                birthDate: 'invalid-date',
                typeId: type.id
            });
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain('Name is required');
            expect(res.text).toContain('Invalid Birth Date');
        });
    });

    describe('Update Pet', () => {
        let pet;
        beforeEach(async () => {
            pet = await Pet.create({ name: 'OldName', birthDate: '2020-01-01', ownerId: owner.id, typeId: type.id });
        });

        test('GET /owners/:id/pets/:id/edit should render form with data', async () => {
            const res = await request(app).get(`/owners/${owner.id}/pets/${pet.id}/edit`);
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain('OldName');
        });

        test('POST /owners/:id/pets/:id/edit should update pet', async () => {
            const res = await request(app).post(`/owners/${owner.id}/pets/${pet.id}/edit`).send({
                name: 'NewName',
                birthDate: '2021-01-01',
                typeId: type.id
            });
            expect(res.statusCode).toBe(302);
            const updated = await Pet.findByPk(pet.id);
            expect(updated.name).toBe('NewName');
        });
    });
});
