const { expect } = require('chai');
const db = require('../models');

describe('Model Layer Tests', () => {
  before(async () => {
    // Use an in-memory or separate test file
    await db.sequelize.options.storage = './test.db';
    await db.sequelize.sync({ force: true });
    await db.seed();
  });

  describe('Owner Model', () => {
    it('should create a valid owner', async () => {
      const owner = await db.Owner.create({
        firstName: 'Test',
        lastName: 'User',
        address: '123 Test St',
        city: 'Test City',
        telephone: '1234567890'
      });
      expect(owner.firstName).to.equal('Test');
    });

    it('should fail validation if telephone is not 10 digits', async () => {
      try {
        await db.Owner.create({
          firstName: 'Bad',
          lastName: 'Phone',
          address: 'Street',
          city: 'City',
          telephone: '123'
        });
        throw new Error('Should have failed');
      } catch (err) {
        expect(err.name).to.equal('SequelizeValidationError');
      }
    });
  });

  describe('Pet Model', () => {
    it('should associate a pet with an owner and type', async () => {
      const owner = await db.Owner.findOne();
      const type = await db.PetType.findOne();
      const pet = await db.Pet.create({
        name: 'Buddy',
        birthDate: '2020-01-01',
        owner_id: owner.id,
        type_id: type.id
      });
      expect(pet.owner_id).to.equal(owner.id);
      expect(pet.type_id).to.equal(type.id);
    });
  });

  describe('Visit Model', () => {
    it('should create a visit for a pet', async () => {
      const pet = await db.Pet.findOne();
      const visit = await db.Visit.create({
        pet_id: pet.id,
        visitDate: '2023-05-05',
        description: 'Checkup'
      });
      expect(visit.description).to.equal('Checkup');
      expect(visit.pet_id).to.equal(pet.id);
    });
  });

  describe('Vet and Specialties', () => {
    it('should associate vets with specialties', async () => {
      const vet = await db.Vet.create({ firstName: 'Helen', lastName: 'Leary' });
      const spec = await db.Specialty.create({ name: 'radiology' });
      await vet.addSpecialty(spec);
      
      const vetWithSpec = await db.Vet.findByPk(vet.id, { include: ['specialties'] });
      expect(vetWithSpec.specialties[0].name).to.equal('radiology');
    });
  });
});
