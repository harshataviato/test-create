const { expect } = require('chai');
const { sequelize, Owner, Pet, PetType, Visit, Vet, Specialty } = require('../src/db/models');

describe('Domain Models & Associations', () => {
    before(async () => {
        // Use a clean slate for testing
        await sequelize.sync({ force: true });
    });

    after(async () => {
        await sequelize.close();
    });

    describe('Owner Model', () => {
        it('should create an owner with valid data', async () => {
            const owner = await Owner.create({
                firstName: 'John',
                lastName: 'Doe',
                address: '123 Google Lane',
                city: 'Mountain View',
                telephone: '1234567890'
            });
            expect(owner.firstName).to.equal('John');
            expect(owner.id).to.not.be.null;
        });

        it('should fail if required fields are missing', async () => {
            try {
                await Owner.create({ firstName: 'Incomplete' });
                throw new Error('Should have failed');
            } catch (err) {
                expect(err.name).to.equal('SequelizeValidationError');
            }
        });
    });

    describe('Pet & PetType Models', () => {
        it('should associate a pet with an owner and a type', async () => {
            const type = await PetType.create({ name: 'hamster' });
            const owner = await Owner.create({
                firstName: 'Jane', lastName: 'Smith', address: '123 St', city: 'City', telephone: '0987654321'
            });
            const pet = await Pet.create({
                name: 'Nibbles',
                birthDate: '2022-01-01',
                typeId: type.id,
                ownerId: owner.id
            });

            const foundPet = await Pet.findByPk(pet.id, { include: [Owner, PetType] });
            expect(foundPet.owner.firstName).to.equal('Jane');
            expect(foundPet.type.name).to.equal('hamster');
        });
    });

    describe('Vet & Specialty Models', () => {
        it('should handle many-to-many relationship between vets and specialties', async () => {
            const vet = await Vet.create({ firstName: 'Linda', lastName: 'Douglas' });
            const spec1 = await Specialty.create({ name: 'radiology' });
            const spec2 = await Specialty.create({ name: 'surgery' });

            await vet.addSpecialties([spec1, spec2]);
            const foundVet = await Vet.findByPk(vet.id, { include: [Specialty] });
            
            expect(foundVet.specialties).to.have.lengthOf(2);
            expect(foundVet.specialties.map(s => s.name)).to.contain('surgery');
        });
    });

    describe('Visit Model', () => {
        it('should link visits to pets', async () => {
            const pet = await Pet.findOne();
            const visit = await Visit.create({
                description: 'Annual checkup',
                petId: pet.id
            });
            expect(visit.petId).to.equal(pet.id);
        });
    });
});
