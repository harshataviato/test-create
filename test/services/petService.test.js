// test/services/petService.test.js
const { expect } = require('chai');
const petService = require('../../src/services/petService');
const { sequelize, models } = require('../../test/config/testDb');
const { Pet, Owner, PetType, Visit } = models;
const moment = require('moment');

describe('Pet Service', () => {
  beforeEach(async () => {
    // Truncate all tables and re-seed for a clean state before each test
    await sequelize.query('TRUNCATE TABLE owners, pets, types, visits, vets, specialties, vet_specialties RESTART IDENTITY CASCADE;');

    // Minimal seed data for pet tests
    await Owner.bulkCreate([
      { id: 1, firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' }
    ]);
    await PetType.bulkCreate([
      { id: 1, name: 'cat' },
      { id: 2, name: 'dog' }
    ]);
    await Pet.bulkCreate([
      { id: 1, name: 'Leo', birthDate: '2000-09-07', typeId: 1, ownerId: 1 },
      { id: 2, name: 'Max', birthDate: '2001-01-15', typeId: 2, ownerId: 1 }
    ]);
    await Visit.bulkCreate([
      { id: 1, petId: 1, visitDate: '2010-03-04', description: 'rabies shot' }
    ]);
  });

  describe('findPetById', () => {
    it('should retrieve a pet by ID with its owner and type', async () => {
      const pet = await petService.findPetById(1);
      expect(pet).to.exist;
      expect(pet.name).to.equal('Leo');
      expect(pet.owner.firstName).to.equal('George');
      expect(pet.type.name).to.equal('cat');
    });

    it('should return null if pet not found', async () => {
      const pet = await petService.findPetById(999);
      expect(pet).to.be.null;
    });
  });

  describe('findPetByIdAndOwnerId', () => {
    it('should retrieve a pet by ID and owner ID with its owner and type', async () => {
      const pet = await petService.findPetByIdAndOwnerId(1, 1);
      expect(pet).to.exist;
      expect(pet.name).to.equal('Leo');
      expect(pet.owner.firstName).to.equal('George');
      expect(pet.type.name).to.equal('cat');
    });

    it('should return null if pet not found for given owner', async () => {
      const pet = await petService.findPetByIdAndOwnerId(1, 999); // Pet 1 belongs to owner 1, not 999
      expect(pet).to.be.null;
    });

    it('should return null if pet ID not found', async () => {
      const pet = await petService.findPetByIdAndOwnerId(999, 1);
      expect(pet).to.be.null;
    });
  });

  describe('savePet', () => {
    it('should create a new pet if it is new', async () => {
      const newPetInstance = new Pet({
        name: 'Buddy',
        birthDate: '2023-01-01',
        typeId: 2,
        ownerId: 1
      });
      const savedPet = await petService.savePet(newPetInstance);
      expect(savedPet).to.exist;
      expect(savedPet.id).to.be.a('number');
      expect(savedPet.name).to.equal('Buddy');

      const foundPet = await Pet.findByPk(savedPet.id);
      expect(foundPet).to.exist;
      expect(foundPet.name).to.equal('Buddy');
    });

    it('should update an existing pet if it is not new', async () => {
      const existingPet = await Pet.findByPk(1); // Leo
      existingPet.name = 'Leopard';
      const updatedPet = await petService.savePet(existingPet);
      expect(updatedPet).to.exist;
      expect(updatedPet.id).to.equal(1);
      expect(updatedPet.name).to.equal('Leopard');

      const foundPet = await Pet.findByPk(1);
      expect(foundPet.name).to.equal('Leopard');
    });

    it('should throw an error if updating a non-existent pet', async () => {
      const nonExistentPet = new Pet({ id: 999, name: 'Ghost', birthDate: '2023-01-01', typeId: 1, ownerId: 1 });
      nonExistentPet.isNew = () => false; // Manually set to not new
      await expect(petService.savePet(nonExistentPet))
        .to.be.rejectedWith('Pet with ID 999 not found for update.');
    });
  });

  describe('updatePet', () => {
    it('should update an existing pet by ID', async () => {
      const updatedData = { name: 'Maximus', birthDate: '2001-02-01' };
      const updatedPet = await petService.updatePet(2, updatedData); // Max
      expect(updatedPet).to.exist;
      expect(updatedPet.name).to.equal('Maximus');
      expect(updatedPet.birthDate).to.equal('2001-02-01');

      const foundPet = await Pet.findByPk(2);
      expect(foundPet.name).to.equal('Maximus');
    });

    it('should return null if pet to update is not found', async () => {
      const updatedData = { name: 'NonExistent' };
      const updatedPet = await petService.updatePet(999, updatedData);
      expect(updatedPet).to.be.null;
    });
  });
});
