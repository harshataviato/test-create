const { sequelize, Owner, Pet, PetType, Vet, Specialty, Visit } = require('../models');

describe('Database Models and Validations', () => {
  beforeAll(async () => {
    // Use in-memory database for testing
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Owner Model', () => {
    it('should create a valid owner', async () => {
      const owner = await Owner.create({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Test St',
        city: 'Test City',
        telephone: '1234567890'
      });
      expect(owner.id).toBeDefined();
      expect(owner.firstName).toBe('John');
    });

    it('should fail if telephone is not 10 digits', async () => {
      try {
        await Owner.create({
          firstName: 'Bad',
          lastName: 'Phone',
          address: 'Street',
          city: 'City',
          telephone: '123'
        });
        fail('Should have thrown a validation error');
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
      }
    });

    it('should fail if telephone contains letters', async () => {
      try {
        await Owner.create({
          firstName: 'Bad',
          lastName: 'Phone',
          address: 'Street',
          city: 'City',
          telephone: 'abcdefghij'
        });
        fail('Should have thrown a validation error');
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
      }
    });
  });

  describe('Associations', () => {
    it('should associate Pets with Owners', async () => {
      const owner = await Owner.create({
        firstName: 'Jane',
        lastName: 'Smith',
        address: '456 Lane',
        city: 'Town',
        telephone: '0987654321'
      });
      const type = await PetType.create({ name: 'hamster' });
      const pet = await Pet.create({
        name: 'Rex',
        birthDate: '2020-01-01',
        ownerId: owner.id,
        typeId: type.id
      });

      const foundOwner = await Owner.findByPk(owner.id, { include: ['pets'] });
      expect(foundOwner.pets.length).toBe(1);
      expect(foundOwner.pets[0].name).toBe('Rex');
    });

    it('should associate Visits with Pets', async () => {
      const pet = await Pet.findOne();
      const visit = await Visit.create({
        petId: pet.id,
        description: 'Checkup',
        date: '2023-10-10'
      });

      const foundPet = await Pet.findByPk(pet.id, { include: ['visits'] });
      expect(foundPet.visits.length).toBe(1);
      expect(foundPet.visits[0].description).toBe('Checkup');
    });

    it('should associate Vets with Specialties', async () => {
      const vet = await Vet.create({ firstName: 'Linda', lastName: 'Douglas' });
      const spec = await Specialty.create({ name: 'surgery' });
      await vet.addSpecialty(spec);

      const foundVet = await Vet.findByPk(vet.id, { include: [Specialty] });
      expect(foundVet.Specialties[0].name).toBe('surgery');
    });
  });
});
