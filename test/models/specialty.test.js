/**
 * @fileoverview Test suite for the Specialty model.
 * Verifies the inheritance from NamedEntity and basic functionality.
 */

const { expect } = require('chai');
const db = require('../../models'); // Adjust path as necessary
const { Specialty, Vet } = db;

describe('Specialty Model', () => {
  describe('Inheritance from NamedEntity', () => {
    it('should inherit the "id" and "name" properties and "isNew" and "toString" getters', () => {
      const specialty = Specialty.build({ id: 1, name: 'dentistry' });
      expect(specialty).to.have.property('id');
      expect(specialty).to.have.property('name');
      expect(specialty.isNew).to.be.false;
      expect(specialty.toString()).to.equal('dentistry');
    });

    it('should require a name for creation', async () => {
      let error;
      try {
        await Specialty.create({});
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('name');
      expect(error.errors[0].type).to.equal('notEmpty');
    });
  });

  describe('Associations', () => {
    it('should allow fetching vets associated with a specialty', async () => {
      const radiologySpecialty = await Specialty.findOne({ where: { name: 'radiology' } });
      const vets = await radiologySpecialty.getVets();
      expect(vets).to.have.lengthOf(2); // Helen Leary, Henry Stevens
      expect(vets.map(v => v.lastName)).to.include.members(['Leary', 'Stevens']);
    });

    it('should allow deletion of a specialty without affecting vets (through: vet_specialties handles removal)', async () => {
      // Create a temporary specialty and associate it with a vet
      const tempVet = await Vet.create({ firstName: 'Temp', lastName: 'Vet' });
      const tempSpecialty = await Specialty.create({ name: 'temp_specialty' });
      await tempVet.addSpecialty(tempSpecialty);

      // Verify association exists
      const vetWithSpecialty = await Vet.findByPk(tempVet.id, { include: { model: Specialty, as: 'specialties' } });
      expect(vetWithSpecialty.specialties).to.have.lengthOf(1);

      // Delete the specialty
      await tempSpecialty.destroy();

      // Verify specialty is gone
      const foundSpecialty = await Specialty.findByPk(tempSpecialty.id);
      expect(foundSpecialty).to.be.null;

      // Verify vet still exists and its association is removed
      const updatedVet = await Vet.findByPk(tempVet.id, { include: { model: Specialty, as: 'specialties' } });
      expect(updatedVet).to.exist;
      expect(updatedVet.specialties).to.have.lengthOf(0); // Association should be removed
    });
  });
});
