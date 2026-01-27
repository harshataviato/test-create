/**
 * @fileoverview Test suite for the Visit model.
 * Verifies visit-specific properties, default values, and associations.
 */

const { expect } = require('chai');
const db = require('../../models'); // Adjust path as necessary
const { Visit, Pet, Owner, PetType } = db;

describe('Visit Model', () => {
  let pet;

  beforeEach(async () => {
    // Ensure we have a pet for association tests
    pet = await Pet.findByPk(1, {
      include: [{ model: Owner, as: 'owner' }, { model: PetType, as: 'type' }]
    }); // Leo
  });

  describe('Properties and Validations', () => {
    it('should create a visit with valid data', async () => {
      const newVisit = await Visit.create({
        visitDate: '2023-11-20',
        description: 'Routine checkup',
        petId: pet.id
      });
      expect(newVisit).to.exist;
      expect(newVisit.date).to.equal('2023-11-20'); // Sequelize DATEONLY stores as string
      expect(newVisit.description).to.equal('Routine checkup');
      expect(newVisit.petId).to.equal(pet.id);
    });

    it('should default visitDate to current date if not provided', async () => {
      const newVisit = await Visit.create({
        description: 'Emergency visit',
        petId: pet.id
      });
      expect(newVisit).to.exist;
      // Compare only the date part, as default value is `DataTypes.NOW` which includes time
      const today = new Date().toISOString().split('T')[0];
      expect(newVisit.date).to.equal(today);
    });

    it('should require description', async () => {
      let error;
      try {
        await Visit.create({
          visitDate: '2023-01-01', petId: pet.id
        });
      } catch (e) { error = e; }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('description');
    });

    it('should not allow an empty description', async () => {
      let error;
      try {
        await Visit.create({
          visitDate: '2023-01-01', description: '', petId: pet.id
        });
      } catch (e) { error = e; }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('description');
    });

    it('should require petId', async () => {
      let error;
      try {
        await Visit.create({
          visitDate: '2023-01-01', description: 'Description'
        });
      } catch (e) { error = e; }
      expect(error).to.exist;
      expect(error.name).to.equal('SequelizeForeignKeyConstraintError'); // Violates NOT NULL and FK
      // The specific error path might be different depending on Sequelize version/config,
      // but the FK constraint error is the key here.
    });
  });

  describe('Associations', () => {
    it('should fetch associated pet', async () => {
      const visit = await Visit.findByPk(1, { include: [{ model: Pet, as: 'pet' }] }); // rabies shot for Samantha
      expect(visit).to.exist;
      expect(visit.description).to.equal('rabies shot');
      expect(visit.pet.name).to.equal('Samantha');
    });
  });

  describe('Constructor behavior', () => {
    it('should set the date to current date if not provided during build', () => {
      const newVisit = Visit.build({ description: 'Testing constructor' });
      const today = new Date().toISOString().split('T')[0];
      expect(newVisit.date).to.equal(today);
    });

    it('should use provided date during build', () => {
      const providedDate = '2020-02-29';
      const newVisit = Visit.build({ description: 'Provided date', date: providedDate });
      expect(newVisit.date).to.equal(providedDate);
    });
  });
});
