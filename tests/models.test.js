import { sequelize, Owner, Pet, PetType, Visit, Vet, Specialty } from '../models/index.js';

describe('Model Unit Tests', () => {
    beforeAll(async () => {
        // Use a clean DB for unit tests
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('Owner Model', () => {
        test('should create an owner successfully', async () => {
            const owner = await Owner.create({
                firstName: 'John',
                lastName: 'Doe',
                address: '123 Test St',
                city: 'Testville',
                telephone: '1234567890'
            });
            expect(owner.id).toBeDefined();
            expect(owner.firstName).toBe('John');
        });

        test('should fail validation if telephone is not 10 digits', async () => {
            try {
                await Owner.create({
                    firstName: 'Jane',
                    lastName: 'Doe',
                    address: '123 Test St',
                    city: 'Testville',
                    telephone: '123' // Invalid
                });
            } catch (error) {
                expect(error.name).toBe('SequelizeValidationError');
            }
        });

        test('should fail if required fields are missing', async () => {
            try {
                await Owner.create({ firstName: 'NoLastname' });
            } catch (error) {
                expect(error.name).toBe('SequelizeValidationError');
            }
        });
    });

    describe('Pet & PetType Model', () => {
        test('should create pet with relationship', async () => {
            const owner = await Owner.create({
                firstName: 'Pet', lastName: 'Lover', address: 'A', city: 'B', telephone: '1234567890'
            });
            const type = await PetType.create({ name: 'Dog' });
            
            const pet = await Pet.create({
                name: 'Buddy',
                birthDate: '2020-01-01',
                ownerId: owner.id,
                typeId: type.id
            });

            const foundPet = await Pet.findByPk(pet.id, { include: ['type', 'owner'] });
            expect(foundPet.type.name).toBe('Dog');
            expect(foundPet.owner.lastName).toBe('Lover');
        });
    });

    describe('Vet & Specialty Model', () => {
        test('should handle many-to-many relationship', async () => {
            const vet = await Vet.create({ firstName: 'Dr', lastName: 'House' });
            const spec = await Specialty.create({ name: 'Diagnostics' });
            
            await vet.addSpecialty(spec);

            const foundVet = await Vet.findByPk(vet.id, { include: ['specialties'] });
            expect(foundVet.specialties.length).toBe(1);
            expect(foundVet.specialties[0].name).toBe('Diagnostics');
        });
    });
});
