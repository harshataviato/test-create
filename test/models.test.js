const { expect } = require('chai');
const { sequelize, Owner, Pet, PetType, Visit, Vet, Specialty } = require('../models');

describe('Model Layer Tests', () => {
  before(async () => {
    // Use a clean slate for model tests
    await sequelize.sync({ force: true });
  });

  describe('Owner Model', () => {
    it('should create a valid owner', async () => {
      const owner = await Owner.create({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Test Lane',
        city: 'Testertown',
        telephone: '1234567890'
      });
      expect(owner.id).to.not.be.null;
      expect(owner.firstName).to.equal('John');
    });

    it('should fail if telephone is not 10 digits', async () => {
      try {
        await Owner.create({
          firstName: 'Bad',
          lastName: 'Phone',
          telephone: '123'
        });
        throw new Error('Should have failed validation');
      } catch (err) {
        expect(err.name).to.equal('SequelizeValidationError');
      }
    });

    it('should fail if names are missing', async () => {
      try {
        await Owner.create({ telephone: '1234567890' });
        throw new Error('Should have failed validation');
      } catch (err) {
        expect(err.name).to.equal('SequelizeValidationError');
      }
    });
  });

  describe('Pet and PetType Models', () => {
    let catType;
    before(async () => {
      catType = await PetType.create({ name: 'cat' });
    });

    it('should associate a pet with a type', async () => {
      const owner = await Owner.findOne();
      const pet = await Pet.create({
        name: 'Misty',
        birthDate: '2020-01-01',
        type_id: catType.id,
        owner_id: owner.id
      });
      expect(pet.name).to.equal('Misty');
      
      const foundPet = await Pet.findByPk(pet.id, { include: [{ model: PetType, as: 'type' }] });
      expect(foundPet.type.name).to.equal('cat');
    });
  });

  describe('Vet and Specialty Models', () => {
    it('should handle many-to-many relationship between vets and specialties', async () => {
      const vet = await Vet.create({ firstName: 'Alice', lastName: 'Smith' });
      const spec = await Specialty.create({ name: 'surgery' });
      
      await vet.addSpecialty(spec);
      
      const vetWithSpecs = await Vet.findByPk(vet.id, { include: [Specialty] });
      expect(vetWithSpecs.Specialties).to.have.lengthOf(1);
      expect(vetWithSpecs.Specialties[0].name).to.equal('surgery');
    });
  });

  describe('Visit Model', () => {
    it('should create a visit for a pet', async () => {
      const pet = await Pet.findOne();
      const visit = await Visit.create({
        visitDate: '2023-10-10',
        description: 'Checkup',
        pet_id: pet.id
      });
      expect(visit.id).to.not.be.null;
      expect(visit.description).to.equal('Checkup');
    });
  });

  after(async () => {
    // No specific teardown needed for SQLite file in models test
  });
});
