const { expect } = require('chai');
const { sequelize, Owner, Pet, PetType, Visit, Vet, Specialty } = require('../src/models');

describe('Model Layer Tests', () => {
  before(async () => {
    // Use a clean slate for model tests
    await sequelize.sync({ force: true });
  });

  describe('Owner & Pet Associations', () => {
    it('should create an owner and associate it with a pet', async () => {
      const owner = await Owner.create({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Test St',
        city: 'Tester',
        telephone: '123456789'
      });

      const type = await PetType.create({ name: 'dog' });
      
      const pet = await Pet.create({
        name: 'Buddy',
        birthDate: '2020-01-01',
        owner_id: owner.id,
        type_id: type.id
      });

      const foundOwner = await Owner.findByPk(owner.id, { include: ['pets'] });
      expect(foundOwner.pets).to.have.lengthOf(1);
      expect(foundOwner.pets[0].name).to.equal('Buddy');
    });
  });

  describe('Vet & Specialty Associations', () => {
    it('should handle many-to-many relationship between Vets and Specialties', async () => {
      const vet = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
      const spec = await Specialty.create({ name: 'radiology' });
      
      await vet.addSpecialty(spec);
      
      const foundVet = await Vet.findByPk(vet.id, { include: [Specialty] });
      expect(foundVet.Specialties).to.have.lengthOf(1);
      expect(foundVet.Specialties[0].name).to.equal('radiology');
    });
  });

  describe('Pet & Visit Associations', () => {
    it('should create visits for a pet', async () => {
      const pet = await Pet.create({ name: 'Misty' });
      const visit = await Visit.create({
        description: 'Checkup',
        date: '2023-05-05',
        pet_id: pet.id
      });

      const foundPet = await Pet.findByPk(pet.id, { include: ['visits'] });
      expect(foundPet.visits).to.have.lengthOf(1);
      expect(foundPet.visits[0].description).to.equal('Checkup');
    });
  });
});
