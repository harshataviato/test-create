/**
 * @fileoverview Test suite for the Vet model.
 * Verifies vet-specific properties, methods, and associations.
 */

const { expect } = require('chai');
const db = require('../../models'); // Adjust path as necessary
const { Vet, Specialty } = db;

describe('Vet Model', () => {
  let radiology;
  let surgery;
  let dentistry;

  beforeEach(async () => {
    // Ensure specialties are available for association tests
    radiology = await Specialty.findOne({ where: { name: 'radiology' } });
    surgery = await Specialty.findOne({ where: { name: 'surgery' } });
    dentistry = await Specialty.findOne({ where: { name: 'dentistry' } });
  });

  describe('Properties and Validations (Inherited from Person)', () => {
    it('should create a vet with valid data', async () => {
      const newVet = await Vet.create({
        firstName: 'Marcus',
        lastName: 'Aurelius'
      });
      expect(newVet).to.exist;
      expect(newVet.firstName).to.equal('Marcus');
      expect(newVet.lastName).to.equal('Aurelius');
    });

    it('should require firstName', async () => {
      let error;
      try {
        await Vet.create({ lastName: 'Aurelius' });
      } catch (e) { error = e; }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('firstName');
    });

    it('should require lastName', async () => {
      let error;
      try {
        await Vet.create({ firstName: 'Marcus' });
      } catch (e) { error = e; }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('lastName');
    });
  });

  describe('Associations', () => {
    it('should allow adding specialties to a vet', async () => {
      const newVet = await Vet.create({ firstName: 'Test', lastName: 'Vet' });
      await newVet.addSpecialty(radiology);
      await newVet.addSpecialty(surgery);

      const vetWithSpecialties = await Vet.findByPk(newVet.id, { include: Specialty });
      expect(vetWithSpecialties.specialties).to.have.lengthOf(2);
      expect(vetWithSpecialties.specialties.map(s => s.name)).to.include.members(['radiology', 'surgery']);
    });

    it('should fetch associated specialties for existing vets', async () => {
      const vet = await Vet.findByPk(3, { include: [{ model: Specialty, as: 'specialties' }] }); // Linda Douglas
      expect(vet).to.exist;
      expect(vet.firstName).to.equal('Linda');
      expect(vet.specialties).to.have.lengthOf(2); // Surgery, Dentistry
      expect(vet.specialties.map(s => s.name)).to.include.members(['surgery', 'dentistry']);
    });
  });

  describe('Custom Methods', () => {
    let vetWithSpecialties;

    beforeEach(async () => {
      // Create a vet and manually associate specialties for method testing
      vetWithSpecialties = await Vet.create({ firstName: 'Method', lastName: 'Test' });
      vetWithSpecialties.specialties = [
        dentistry.toJSON(), // use toJSON to get plain objects, mimicking a fresh query result
        radiology.toJSON(),
        surgery.toJSON(),
      ];
    });

    describe('getSpecialties()', () => {
      it('should return specialties sorted by name', () => {
        const sortedSpecialties = vetWithSpecialties.getSpecialties();
        expect(sortedSpecialties.map(s => s.name)).to.deep.equal(['dentistry', 'radiology', 'surgery']);
      });

      it('should return an empty array if no specialties are associated', () => {
        const vetNoSpecialties = Vet.build({ firstName: 'No', lastName: 'Specs' });
        expect(vetNoSpecialties.getSpecialties()).to.be.an('array').that.is.empty;
      });

      it('should handle null specialties array gracefully', () => {
        const vetNoSpecialties = Vet.build({ firstName: 'Null', lastName: 'Specs' });
        vetNoSpecialties.specialties = null; // Explicitly set to null
        expect(vetNoSpecialties.getSpecialties()).to.be.an('array').that.is.empty;
      });
    });

    describe('getNrOfSpecialties()', () => {
      it('should return the correct count of specialties', () => {
        expect(vetWithSpecialties.getNrOfSpecialties()).to.equal(3);
      });

      it('should return 0 if no specialties are associated', () => {
        const vetNoSpecialties = Vet.build({ firstName: 'No', lastName: 'Specs' });
        expect(vetNoSpecialties.getNrOfSpecialties()).to.equal(0);
      });

      it('should return 0 if specialties array is null', () => {
        const vetNoSpecialties = Vet.build({ firstName: 'Null', lastName: 'Specs' });
        vetNoSpecialties.specialties = null;
        expect(vetNoSpecialties.getNrOfSpecialties()).to.equal(0);
      });
    });

    describe('addSpecialty(specialty)', () => {
      it('should add a specialty to the in-memory array', () => {
        const initialCount = vetWithSpecialties.specialties.length;
        const newSpecialty = Specialty.build({ id: 99, name: 'ophthalmology' });
        vetWithSpecialties.addSpecialty(newSpecialty);
        expect(vetWithSpecialties.specialties).to.have.lengthOf(initialCount + 1);
        expect(vetWithSpecialties.specialties.some(s => s.name === 'ophthalmology')).to.be.true;
      });

      it('should initialize specialties array if null before adding', () => {
        const vetNew = Vet.build({ firstName: 'New', lastName: 'Vet' });
        expect(vetNew.specialties).to.be.undefined;
        vetNew.addSpecialty(radiology);
        expect(vetNew.specialties).to.have.lengthOf(1);
        expect(vetNew.specialties[0].name).to.equal('radiology');
      });
    });
  });
});
