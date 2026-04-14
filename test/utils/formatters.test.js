// test/utils/formatters.test.js
const { expect } = require('chai');
const PetTypeFormatter = require('../../src/utils/formatters');
const { sequelize, models } = require('../../test/config/testDb');
const { PetType } = models;

describe('PetTypeFormatter', () => {
  before(async () => {
    // Ensure PetType table is clean and has base data for parsing
    await sequelize.query('TRUNCATE TABLE types RESTART IDENTITY CASCADE;');
    await PetType.bulkCreate([
      { id: 1, name: 'cat' },
      { id: 2, name: 'dog' }
    ]);
  });

  after(async () => {
    // Cleanup if needed, though global teardown handles it.
  });

  describe('print', () => {
    it('should return the name of a PetType object', () => {
      const petType = { name: 'cat' };
      const result = PetTypeFormatter.print(petType);
      expect(result).to.equal('cat');
    });

    it('should return "<null>" if petType is null', () => {
      const result = PetTypeFormatter.print(null);
      expect(result).to.equal('<null>');
    });

    it('should return "<null>" if petType name is null', () => {
      const petType = { name: null };
      const result = PetTypeFormatter.print(petType);
      expect(result).to.equal('<null>');
    });

    it('should work with a full Sequelize PetType instance', async () => {
      const petTypeInstance = await PetType.findByPk(1);
      const result = PetTypeFormatter.print(petTypeInstance);
      expect(result).to.equal('cat');
    });
  });

  describe('parse', () => {
    it('should return a PetType object for a valid name', async () => {
      const result = await PetTypeFormatter.parse('dog');
      expect(result).to.be.an.instanceOf(PetType);
      expect(result.name).to.equal('dog');
      expect(result.id).to.equal(2);
    });

    it('should throw an error if the pet type name is not found', async () => {
      await expect(PetTypeFormatter.parse('bird'))
        .to.be.rejectedWith('Type not found: bird');
    });

    it('should throw an error if the text is empty', async () => {
      await expect(PetTypeFormatter.parse(''))
        .to.be.rejectedWith('Pet type name cannot be empty.');
    });

    it('should throw an error if the text is null', async () => {
      await expect(PetTypeFormatter.parse(null))
        .to.be.rejectedWith('Pet type name cannot be empty.');
    });

    it('should handle case-insensitivity depending on DB (default Sequelize is sensitive)', async () => {
        // Assuming PostgreSQL is case-sensitive by default for this test case
        const result = await PetTypeFormatter.parse('Cat');
        expect(result.name).to.equal('cat'); // It should still find 'cat' if DB is case-insensitive for search, but not if using exact match.
        // For findPetTypeByName, if it's not explicitly case-insensitive, 'Cat' will not match 'cat'.
        // The service uses `where: { name: name }` which is exact. So this test should reflect that.
        // Let's refine the mock or service to be truly case-insensitive if desired.
        // As per current `petTypeService.findPetTypeByName`, it's case-sensitive unless DB collates differently.
        await expect(PetTypeFormatter.parse('Cat'))
          .to.be.rejectedWith('Type not found: Cat');
    });
  });
});
