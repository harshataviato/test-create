// test/services/petTypeService.test.js
const { expect } = require('chai');
const petTypeService = require('../../src/services/petTypeService');
const { sequelize, models } = require('../../test/config/testDb');
const { PetType } = models;

describe('PetType Service', () => {
  beforeEach(async () => {
    // Truncate all tables and re-seed for a clean state before each test
    await sequelize.query('TRUNCATE TABLE owners, pets, types, visits, vets, specialties, vet_specialties RESTART IDENTITY CASCADE;');

    // Minimal seed data for pet type tests
    await PetType.bulkCreate([
      { id: 1, name: 'cat' },
      { id: 2, name: 'dog' },
      { id: 3, name: 'lizard' }
    ]);
  });

  describe('findAllPetTypes', () => {
    it('should retrieve all pet types ordered by name', async () => {
      const petTypes = await petTypeService.findAllPetTypes();
      expect(petTypes).to.be.an('array').with.lengthOf(3);
      expect(petTypes.map(type => type.name)).to.deep.equal(['cat', 'dog', 'lizard']); // Ordered alphabetically
    });

    it('should return an empty array if no pet types exist', async () => {
      await PetType.destroy({ truncate: true, cascade: true }); // Clear all pet types
      const petTypes = await petTypeService.findAllPetTypes();
      expect(petTypes).to.be.an('array').with.lengthOf(0);
    });
  });

  describe('findPetTypeByName', () => {
    it('should retrieve a pet type by its exact name', async () => {
      const petType = await petTypeService.findPetTypeByName('dog');
      expect(petType).to.exist;
      expect(petType.name).to.equal('dog');
      expect(petType.id).to.equal(2);
    });

    it('should return null if pet type name not found', async () => {
      const petType = await petTypeService.findPetTypeByName('bird');
      expect(petType).to.be.null;
    });

    it('should be case-sensitive (default Sequelize behavior)', async () => {
      const petType = await petTypeService.findPetTypeByName('Dog'); // Assuming PostgreSQL default is case-sensitive
      expect(petType).to.be.null; // If DB collation is case-sensitive
    });
  });
});
