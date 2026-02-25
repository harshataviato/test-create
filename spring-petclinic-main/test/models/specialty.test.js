/**
 * @file test/models/specialty.test.js
 * @description Automated tests for the Specialty model.
 */

process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const { Specialty, Vet, sequelize } = require('../../models');
const { resetAndSeedDatabase } = require('../helpers');

describe('Specialty Model', () => {
  before(async () => {
    await resetAndSeedDatabase();
  });

  it('should create a new specialty with valid data', async () => {
    const specialty = await Specialty.create({ name: 'ophthalmology' });
    expect(specialty).to.exist;
    expect(specialty.name).to.equal('ophthalmology');
    expect(specialty.id).to.be.a('number');
  });

  it('should not create a specialty with a missing name', async () => {
    let error;
    try {
      await Specialty.create({});
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeValidationError');
    expect(error.errors[0].message).to.equal('Specialty name cannot be empty.');
  });

  it('should not create a specialty with a duplicate name', async () => {
    let error;
    try {
      await Specialty.create({ name: 'radiology' }); // 'radiology' already exists from seeding
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeUniqueConstraintError');
    expect(error.errors[0].message).to.equal('name must be unique');
  });

  it('should find a specialty by ID', async () => {
    const existingSpecialty = await Specialty.findByPk(1); // 'radiology'
    expect(existingSpecialty).to.exist;
    expect(existingSpecialty.name).to.equal('radiology');
  });

  it('should update an existing specialty', async () => {
    const specialty = await Specialty.create({ name: 'neurology' });
    await specialty.update({ name: 'dermatology' });
    const updatedSpecialty = await Specialty.findByPk(specialty.id);
    expect(updatedSpecialty.name).to.equal('dermatology');
  });

  it('should delete a specialty', async () => {
    const specialty = await Specialty.create({ name: 'cardiology' });
    await Specialty.destroy({ where: { id: specialty.id } });
    const deletedSpecialty = await Specialty.findByPk(specialty.id);
    expect(deletedSpecialty).to.be.null;
  });

  it('should correctly identify a new specialty as new', () => {
    const newSpecialty = Specialty.build();
    expect(newSpecialty.isNew()).to.be.true;
  });

  it('should correctly identify an existing specialty as not new', async () => {
    const existingSpecialty = await Specialty.findByPk(1);
    expect(existingSpecialty.isNew()).to.be.false;
  });

  // Test association with Vet model (Many-to-Many)
  it('should retrieve vets associated with a specialty', async () => {
    const radiology = await Specialty.findOne({
      where: { name: 'radiology' },
      include: [{ model: Vet, as: 'vets' }]
    });
    expect(radiology).to.exist;
    expect(radiology.vets).to.exist;
    expect(radiology.vets).to.have.lengthOf(2); // Helen Leary (id=2) and Henry Stevens (id=5)
    expect(radiology.vets.some(vet => vet.firstName === 'Helen')).to.be.true;
    expect(radiology.vets.some(vet => vet.firstName === 'Henry')).to.be.true;
  });
});

