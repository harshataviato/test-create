/**
 * @fileoverview Test suite for the PetType model.
 * Verifies the inheritance from NamedEntity and basic functionality.
 */

const { expect } = require('chai');
const db = require('../../models'); // Adjust path as necessary
const { PetType, Pet } = db;

describe('PetType Model', () => {
  describe('Inheritance from NamedEntity', () => {
    it('should inherit the "id" and "name" properties and "isNew" and "toString" getters', async () => {
      const type = PetType.build({ id: 1, name: 'dog' });
      expect(type).to.have.property('id');
      expect(type).to.have.property('name');
      expect(type.isNew).to.be.false;
      expect(type.toString()).to.equal('dog');
    });

    it('should require a name for creation', async () => {
      let error;
      try {
        await PetType.create({});
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('name');
      expect(error.errors[0].type).to.equal('notEmpty');
    });
  });

  describe('Associations', () => {
    it('should allow fetching pets associated with a type', async () => {
      const dogType = await PetType.findOne({ where: { name: 'dog' } });
      const pets = await dogType.getPets();
      expect(pets).to.have.lengthOf(4); // Rosy, Jewel, Mulligan, Lucky (owner 10)
      expect(pets.map(p => p.name)).to.include.members(['Rosy', 'Jewel', 'Mulligan', 'Lucky']);
    });

    it('should restrict deletion if pets are associated (RESTRICT)', async () => {
      const catType = await PetType.findOne({ where: { name: 'cat' } });
      expect(catType).to.exist;

      let error;
      try {
        await catType.destroy();
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.name).to.equal('SequelizeForeignKeyConstraintError');
      expect(error.message).to.include('violates foreign key constraint "pets_type_id_fkey"');

      // Verify it still exists
      const foundCatType = await PetType.findByPk(catType.id);
      expect(foundCatType).to.exist;
    });

    it('should allow deletion if no pets are associated', async () => {
      const newPetType = await PetType.create({ name: 'fish' });
      expect(newPetType).to.exist;

      await newPetType.destroy();

      const foundPetType = await PetType.findByPk(newPetType.id);
      expect(foundPetType).to.be.null;
    });
  });
});
