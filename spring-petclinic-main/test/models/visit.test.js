/**
 * @file test/models/visit.test.js
 * @description Automated tests for the Visit model.
 */

process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const { Visit, Pet, Owner, PetType, sequelize } = require('../../models');
const { resetAndSeedDatabase } = require('../helpers');
const moment = require('moment');

describe('Visit Model', () => {
  let pet;

  before(async () => {
    await resetAndSeedDatabase();
    const owner = await Owner.create({
      firstName: 'Visit',
      lastName: 'Owner',
      address: '789 Clinic St',
      city: 'Vetville',
      telephone: '4445556666'
    });
    const petType = await PetType.create({ name: 'bird' });
    pet = await Pet.create({
      name: 'Tweety',
      birthDate: '2022-01-01',
      typeId: petType.id,
      ownerId: owner.id
    });
  });

  it('should create a new visit with valid data', async () => {
    const visit = await Visit.create({
      petId: pet.id,
      visitDate: '2023-01-10',
      description: 'Annual checkup'
    });

    expect(visit).to.exist;
    expect(visit.petId).to.equal(pet.id);
    expect(visit.visitDate).to.equal('2023-01-10');
    expect(visit.description).to.equal('Annual checkup');
    expect(visit.id).to.be.a('number');
  });

  it('should not create a visit with a missing pet ID', async () => {
    let error;
    try {
      await Visit.create({
        visitDate: '2023-01-11',
        description: 'Missing pet ID'
      });
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeValidationError');
    expect(error.errors[0].message).to.equal('Visit.pet_id cannot be null');
  });

  it('should not create a visit with a missing visit date', async () => {
    let error;
    try {
      await Visit.create({
        petId: pet.id,
        description: 'Missing date'
      });
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeValidationError');
    expect(error.errors[0].message).to.equal('Visit date cannot be empty.');
  });

  it('should not create a visit with an invalid visit date format', async () => {
    let error;
    try {
      await Visit.create({
        petId: pet.id,
        visitDate: 'invalid-date-format',
        description: 'Invalid date'
      });
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeValidationError');
    expect(error.errors[0].message).to.equal('Invalid visit date format. Use YYYY-MM-DD.');
  });

  it('should not create a visit with a missing description', async () => {
    let error;
    try {
      await Visit.create({
        petId: pet.id,
        visitDate: '2023-01-12'
      });
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeValidationError');
    expect(error.errors[0].message).to.equal('Description cannot be empty.');
  });

  it('should find a visit by ID and include its pet', async () => {
    const visit = await Visit.findByPk(1, { include: [{ model: Pet, as: 'pet' }] }); // Visit for Samantha (pet ID 7)
    expect(visit).to.exist;
    expect(visit.description).to.equal('rabies shot');
    expect(visit.pet).to.exist;
    expect(visit.pet.name).to.equal('Samantha');
  });

  it('should update an existing visit', async () => {
    const visit = await Visit.create({
      petId: pet.id,
      visitDate: '2023-02-01',
      description: 'Initial description'
    });
    await visit.update({ description: 'Updated description', visitDate: '2023-02-02' });

    const updatedVisit = await Visit.findByPk(visit.id);
    expect(updatedVisit.description).to.equal('Updated description');
    expect(updatedVisit.visitDate).to.equal('2023-02-02');
  });

  it('should delete a visit', async () => {
    const visit = await Visit.create({
      petId: pet.id,
      visitDate: '2023-03-01',
      description: 'To be deleted'
    });
    await Visit.destroy({ where: { id: visit.id } });

    const deletedVisit = await Visit.findByPk(visit.id);
    expect(deletedVisit).to.be.null;
  });

  it('should correctly identify a new visit as new', () => {
    const newVisit = Visit.build();
    expect(newVisit.isNew()).to.be.true;
  });

  it('should correctly identify an existing visit as not new', async () => {
    const existingVisit = await Visit.findByPk(1);
    expect(existingVisit.isNew()).to.be.false;
  });
});

