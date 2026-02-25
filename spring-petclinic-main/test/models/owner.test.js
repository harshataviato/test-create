/**
 * @file test/models/owner.test.js
 * @description Automated tests for the Owner model.
 */

process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const { Owner, Pet, PetType, Visit, sequelize } = require('../../models');
const { resetAndSeedDatabase } = require('../helpers');
const moment = require('moment');

describe('Owner Model', () => {
  before(async () => {
    // Reset and seed the database before all tests in this file
    await resetAndSeedDatabase();
  });

  // Ensure database is clean after all tests in this file
  after(async () => {
    // You might want to optionally clean up or close connection,
    // but helper's resetAndSeedDatabase handles setup for next file.
    // await sequelize.close(); // Not closing here as other test files might need it.
  });

  // Test case 1: Create a new owner successfully
  it('should create a new owner with valid data', async () => {
    const owner = await Owner.create({
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Test St',
      city: 'Testville',
      telephone: '1234567890'
    });

    expect(owner).to.exist;
    expect(owner.firstName).to.equal('John');
    expect(owner.lastName).to.equal('Doe');
    expect(owner.id).to.be.a('number');
  });

  // Test case 2: Fail to create an owner with missing first name
  it('should not create an owner with missing first name', async () => {
    let error;
    try {
      await Owner.create({
        lastName: 'Doe',
        address: '123 Test St',
        city: 'Testville',
        telephone: '1234567890'
      });
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeValidationError');
    expect(error.errors[0].message).to.equal('First name cannot be empty.');
  });

  // Test case 3: Fail to create an owner with invalid telephone format
  it('should not create an owner with an invalid telephone format', async () => {
    let error;
    try {
      await Owner.create({
        firstName: 'Jane',
        lastName: 'Doe',
        address: '456 Another Rd',
        city: 'Anywhere',
        telephone: 'invalid' // Invalid telephone
      });
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeValidationError');
    expect(error.errors[0].message).to.equal('Telephone must be a 10-digit number.');
  });

  // Test case 4: Find an owner by ID
  it('should find an owner by ID', async () => {
    const existingOwner = await Owner.findByPk(1); // Owner with ID 1 is seeded data
    expect(existingOwner).to.exist;
    expect(existingOwner.firstName).to.equal('George');
  });

  // Test case 5: Update an existing owner
  it('should update an existing owner', async () => {
    const owner = await Owner.findByPk(1);
    await owner.update({ telephone: '9876543210' });
    const updatedOwner = await Owner.findByPk(1);
    expect(updatedOwner.telephone).to.equal('9876543210');
  });

  // Test case 6: Delete an owner and cascade delete pets
  it('should delete an owner and their associated pets', async () => {
    const ownerIdToDelete = 6; // Owner 'Jean Coleman' has pets Samantha and Max (IDs 7, 8)
    const petsBeforeDelete = await Pet.findAll({ where: { ownerId: ownerIdToDelete } });
    expect(petsBeforeDelete).to.have.lengthOf(2);

    await Owner.destroy({ where: { id: ownerIdToDelete } });

    const deletedOwner = await Owner.findByPk(ownerIdToDelete);
    expect(deletedOwner).to.be.null;

    const petsAfterDelete = await Pet.findAll({ where: { ownerId: ownerIdToDelete } });
    expect(petsAfterDelete).to.have.lengthOf(0);
  });

  // Test case 7: `isNew()` method for a new owner
  it('should correctly identify a new owner as new', () => {
    const newOwner = Owner.build();
    expect(newOwner.isNew()).to.be.true;
  });

  // Test case 8: `isNew()` method for an existing owner
  it('should correctly identify an existing owner as not new', async () => {
    const existingOwner = await Owner.findByPk(1);
    expect(existingOwner.isNew()).to.be.false;
  });

  // Test case 9: `getPet()` method by name
  it('should retrieve a pet by name from an owner', async () => {
    const owner = await Owner.findByPk(1, { include: ['pets'] });
    const pet = owner.getPet('Leo');
    expect(pet).to.exist;
    expect(pet.name).to.equal('Leo');
  });

  // Test case 10: `getPet()` method by ID
  it('should retrieve a pet by ID from an owner', async () => {
    const owner = await Owner.findByPk(1, { include: ['pets'] });
    const pet = owner.getPet(1); // Pet 'Leo' has ID 1
    expect(pet).to.exist;
    expect(pet.name).to.equal('Leo');
  });

  // Test case 11: `getPet()` method for non-existent pet
  it('should return null for a non-existent pet', async () => {
    const owner = await Owner.findByPk(1, { include: ['pets'] });
    const nonExistentPet = owner.getPet('NonExistentPet');
    expect(nonExistentPet).to.be.null;
  });

  // Test case 12: `getPet()` method with ignoreNew for new pet
  it('should return null for new pet if ignoreNew is true', async () => {
    const owner = await Owner.findByPk(1, { include: ['pets'] });
    const newPet = await Pet.create({ name: 'Temp', birthDate: '2023-01-01', typeId: 1, ownerId: owner.id });
    owner.pets.push(newPet); // Manually add to in-memory collection

    const foundPet = owner.getPet('Temp', true); // Should find it because newPet is saved
    expect(foundPet).to.exist;

    // Simulate adding a new unsaved pet
    const unsavedPet = Pet.build({ name: 'Unsaved', birthDate: '2023-01-01', typeId: 1, ownerId: owner.id });
    owner.pets.push(unsavedPet);
    const foundUnsavedPet = owner.getPet('Unsaved', true);
    expect(foundUnsavedPet).to.be.null; // Should be null as ignoreNew is true

    const foundUnsavedPetIncludingNew = owner.getPet('Unsaved', false);
    expect(foundUnsavedPetIncludingNew).to.exist;
  });

  // Test case 13: `addVisit()` method
  it('should add a visit to a pet of the owner', async () => {
    const owner = await Owner.findByPk(1, {
      include: [{
        model: Pet,
        as: 'pets',
        include: [{ model: Visit, as: 'visits' }]
      }]
    });
    const pet = owner.pets[0]; // Get Leo (ID 1)
    const initialVisitCount = pet.visits ? pet.visits.length : 0;

    const newVisitData = {
      date: moment().format('YYYY-MM-DD'),
      description: 'Checkup'
    };

    const newVisit = await owner.addVisit(pet.id, newVisitData);

    expect(newVisit).to.exist;
    expect(newVisit.petId).to.equal(pet.id);
    expect(newVisit.description).to.equal('Checkup');

    // Re-fetch owner to confirm DB state and in-memory association update
    const updatedOwner = await Owner.findByPk(1, {
      include: [{
        model: Pet,
        as: 'pets',
        include: [{ model: Visit, as: 'visits' }]
      }]
    });
    const updatedPet = updatedOwner.pets.find(p => p.id === pet.id);
    expect(updatedPet.visits).to.have.lengthOf(initialVisitCount + 1);
  });

  // Test case 14: `addVisit()` should throw error if pet not found
  it('should throw an error when adding a visit to a non-existent pet', async () => {
    const owner = await Owner.findByPk(1, { include: ['pets'] });
    const nonExistentPetId = 999;
    const newVisitData = {
      date: moment().format('YYYY-MM-DD'),
      description: 'Non-existent pet visit'
    };

    let error;
    try {
      await owner.addVisit(nonExistentPetId, newVisitData);
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.message).to.include(`Pet with ID ${nonExistentPetId} not found for owner ${owner.id}`);
  });
});

