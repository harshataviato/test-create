const { expect } = require('chai');
const { sequelize, Owner, Pet, PetType, Visit, Vet, Specialty } = require('../models');

describe('Models Unit Tests', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  describe('Owner Model', () => {
    it('should create and retrieve an owner', async () => {
      const owner = await Owner.create({
        firstName: 'QA',
        lastName: 'Engineer',
        address: '1600 Amphitheatre Pkwy',
        city: 'Mountain View',
        telephone: '1234567890'
      });
      expect(owner.firstName).to.equal('QA');
      expect(owner.id).to.not.be.null;
    });
  });

  describe('Pet and PetType Models', () => {
    it('should link a pet to a type and an owner', async () => {
      const type = await PetType.create({ name: 'dragon' });
      const owner = await Owner.create({ firstName: 'Hiccup', lastName: 'Haddock' });
      const pet = await Pet.create({
        name: 'Toothless',
        birthDate: '2020-01-01',
        typeId: type.id,
        ownerId: owner.id
      });

      const foundPet = await Pet.findByPk(pet.id, { include: ['type', Owner] });
      expect(foundPet.name).to.equal('Toothless');
      expect(foundPet.type.name).to.equal('dragon');
      expect(foundPet.Owner.firstName).to.equal('Hiccup');
    });
  });

  describe('Visit Model', () => {
    it('should create a visit for a pet', async () => {
      const pet = await Pet.create({ name: 'Buddy' });
      const visit = await Visit.create({
        petId: pet.id,
        description: 'Checkup',
        date: '2023-10-10'
      });
      expect(visit.description).to.equal('Checkup');
      expect(visit.petId).to.equal(pet.id);
    });
  });

  describe('Vet and Specialty Models', () => {
    it('should associate vets with multiple specialties', async () => {
      const vet = await Vet.create({ firstName: 'John', lastName: 'Doe' });
      const spec1 = await Specialty.create({ name: 'Surgery' });
      const spec2 = await Specialty.create({ name: 'Radiology' });
      
      await vet.addSpecialties([spec1, spec2]);
      
      const foundVet = await Vet.findByPk(vet.id, { include: { model: Specialty, as: 'specialties' } });
      expect(foundVet.specialties).to.have.lengthOf(2);
      expect(foundVet.specialties.map(s => s.name)).to.contain('Surgery');
    });
  });
});
