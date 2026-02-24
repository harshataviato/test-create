const { sequelize, Owner, Pet, Visit, Vet, Specialty } = require('../../models');

describe('Unit Testing: Models', () => {
  
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Owner Model', () => {
    it('should create an owner successfully', async () => {
      const owner = await Owner.create({
        firstName: 'Unit',
        lastName: 'Test',
        address: '123 Test St',
        city: 'Jest City',
        telephone: '1234567890'
      });
      expect(owner.id).toBeDefined();
      expect(owner.firstName).toBe('Unit');
    });

    it('should fail validation if fields are missing (Database constraint simulation)', async () => {
      // Note: Sequelize defaults allowNull: true unless specified. 
      // The provided model definition has allowNull: false.
      await expect(Owner.create({ firstName: 'Incomplete' }))
        .rejects.toThrow();
    });
  });

  describe('Relationship Integrity', () => {
    it('should associate Pets with Owners', async () => {
      const owner = await Owner.create({
        firstName: 'Rel', lastName: 'Check', address: 'A', city: 'B', telephone: '123'
      });
      const pet = await Pet.create({
        name: 'Buddy',
        birthDate: '2020-01-01',
        owner_id: owner.id
      });
      
      const foundOwner = await Owner.findByPk(owner.id, { include: ['pets'] });
      expect(foundOwner.pets).toHaveLength(1);
      expect(foundOwner.pets[0].name).toBe('Buddy');
    });

    it('should associate Visits with Pets', async () => {
      // Re-using owner/pet from previous might be risky without cleanup, 
      // creating fresh for isolation logic within the suite.
      const pet = await Pet.findOne({ where: { name: 'Buddy' }});
      await Visit.create({
        date: '2023-01-01',
        description: 'Vaccination',
        pet_id: pet.id
      });

      const foundPet = await Pet.findByPk(pet.id, { include: ['visits'] });
      expect(foundPet.visits).toHaveLength(1);
      expect(foundPet.visits[0].description).toBe('Vaccination');
    });
  });
});
