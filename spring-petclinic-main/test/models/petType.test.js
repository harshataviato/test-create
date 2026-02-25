/**
 * @file test/models/petType.test.js
 * @description Automated tests for the PetType model.
 */

process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const { PetType, sequelize } = require('../../models');
const { resetAndSeedDatabase } = require('../helpers');

describe('PetType Model', () => {
  before(async () => {
    await resetAndSeedDatabase();
  });

  it('should create a new pet type with valid data', async () => {
    const petType = await PetType.create({ name: 'fish' });
    expect(petType).to.exist;
    expect(petType.name).to.equal('fish');
    expect(petType.id).to.be.a('number');
  });

  it('should not create a pet type with a missing name', async () => {
    let error;
    try {
      await PetType.create({});
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeValidationError');
    expect(error.errors[0].message).to.equal('Pet type name cannot be empty.');
  });

  it('should not create a pet type with a duplicate name', async () => {
    let error;
    try {
      await PetType.create({ name: 'cat' }); // 'cat' already exists from seeding
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeUniqueConstraintError');
    expect(error.errors[0].message).to.equal('name must be unique');
  });

  it('should find a pet type by ID', async () => {
    const existingPetType = await PetType.findByPk(1); // 'cat'
    expect(existingPetType).to.exist;
    expect(existingPetType.name).to.equal('cat');
  });

  it('should update an existing pet type', async () => {
    const petType = await PetType.create({ name: 'bunny' });
    await petType.update({ name: 'rabbit' });
    const updatedPetType = await PetType.findByPk(petType.id);
    expect(updatedPetType.name).to.equal('rabbit');
  });

  it('should delete a pet type', async () => {
    const petType = await PetType.create({ name: 'parrot' });
    await PetType.destroy({ where: { id: petType.id } });
    const deletedPetType = await PetType.findByPk(petType.id);
    expect(deletedPetType).to.be.null;
  });

  it('should correctly identify a new pet type as new', () => {
    const newPetType = PetType.build();
    expect(newPetType.isNew()).to.be.true;
  });

  it('should correctly identify an existing pet type as not new', async () => {
    const existingPetType = await PetType.findByPk(1);
    expect(existingPetType.isNew()).to.be.false;
  });

  // Test association with Pet model (Pets have a typeId)
  it('should retrieve pets associated with a pet type', async () => {
    const catType = await PetType.findOne({ where: { name: 'cat' }, include: ['pets'] });
    expect(catType).to.exist;
    expect(catType.pets).to.exist;
    // Assuming Leo (id=1) is a cat
    expect(catType.pets.some(pet => pet.name === 'Leo')).to.be.true;
  });
});

