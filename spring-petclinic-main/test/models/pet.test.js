/**
 * @file test/models/pet.test.js
 * @description Automated tests for the Pet model.
 */

process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const { Pet, Owner, PetType, Visit, sequelize } = require('../../models');
const { resetAndSeedDatabase } = require('../helpers');
const moment = require('moment');

describe('Pet Model', () => {
  let owner, petType;

  before(async () => {
    await resetAndSeedDatabase();
    owner = await Owner.create({
      firstName: 'Test',
      lastName: 'Owner',
      address: '123 Pet Lane',
      city: 'Animalville',
      telephone: '1112223333'
    });
    petType = await PetType.create({ name: 'dog' });
  });

  it('should create a new pet with valid data', async () => {
    const pet = await Pet.create({
      name: 'Buddy',
      birthDate: '2020-01-15',
      typeId: petType.id,
      ownerId: owner.id
    });

    expect(pet).to.exist;
    expect(pet.name).to.equal('Buddy');
    expect(pet.birthDate).to.equal('2020-01-15');
    expect(pet.typeId).to.equal(petType.id);
    expect(pet.ownerId).to.equal(owner.id);
    expect(pet.id).to.be.a('number');
  });

  it('should not create a pet with a missing name', async () => {
    let error;
    try {
      await Pet.create({
        birthDate: '2021-02-20',
        typeId: petType.id,
        ownerId: owner.id
      });
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeValidationError');
    expect(error.errors[0].message).to.equal('Pet name cannot be empty.');
  });

  it('should not create a pet with a missing birth date', async () => {
    let error;
    try {
      await Pet.create({
        name: 'Max',
        typeId: petType.id,
        ownerId: owner.id
      });
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeValidationError');
    expect(error.errors[0].message).to.equal('Birth date cannot be empty.');
  });

  it('should not create a pet with an invalid birth date format', async () => {
    let error;
    try {
      await Pet.create({
        name: 'Sparky',
        birthDate: 'invalid-date',
        typeId: petType.id,
        ownerId: owner.id
      });
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeValidationError');
    expect(error.errors[0].message).to.equal('Invalid birth date format. Use YYYY-MM-DD.');
  });

  it('should not create a pet with a missing type ID', async () => {
    let error;
    try {
      await Pet.create({
        name: 'Charlie',
        birthDate: '2022-03-01',
        ownerId: owner.id
      });
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeValidationError');
    expect(error.errors[0].message).to.equal('Pet.type_id cannot be null');
  });

  it('should find a pet by ID and include its owner and type', async () => {
    const pet = await Pet.findByPk(1, {
      include: [{ model: Owner, as: 'owner' }, { model: PetType, as: 'type' }]
    });

    expect(pet).to.exist;
    expect(pet.name).to.equal('Leo');
    expect(pet.owner).to.exist;
    expect(pet.owner.firstName).to.equal('George');
    expect(pet.type).to.exist;
    expect(pet.type.name).to.equal('cat');
  });

  it('should update an existing pet', async () => {
    const pet = await Pet.create({
      name: 'OldName',
      birthDate: '2019-05-10',
      typeId: petType.id,
      ownerId: owner.id
    });
    await pet.update({ name: 'NewName', birthDate: '2019-06-15' });

    const updatedPet = await Pet.findByPk(pet.id);
    expect(updatedPet.name).to.equal('NewName');
    expect(updatedPet.birthDate).to.equal('2019-06-15');
  });

  it('should delete a pet', async () => {
    const pet = await Pet.create({
      name: 'ToDelete',
      birthDate: '2018-01-01',
      typeId: petType.id,
      ownerId: owner.id
    });
    await Pet.destroy({ where: { id: pet.id } });

    const deletedPet = await Pet.findByPk(pet.id);
    expect(deletedPet).to.be.null;
  });

  it('should correctly identify a new pet as new', () => {
    const newPet = Pet.build();
    expect(newPet.isNew()).to.be.true;
  });

  it('should correctly identify an existing pet as not new', async () => {
    const existingPet = await Pet.findByPk(1);
    expect(existingPet.isNew()).to.be.false;
  });

  it('should cascade delete visits when a pet is deleted', async () => {
    const existingPet = await Pet.findByPk(7, { include: ['visits'] }); // Samantha, has 2 visits
    expect(existingPet.visits).to.have.lengthOf(2);

    await Pet.destroy({ where: { id: existingPet.id } });

    const visitsAfterDelete = await Visit.findAll({ where: { petId: existingPet.id } });
    expect(visitsAfterDelete).to.have.lengthOf(0);
  });
});

