// test/models/specialty.test.js
const { expect } = require('chai');
const { sequelize, models } = require('../../test/config/testDb');
const { Specialty } = models;

describe('Specialty Model', () => {
  beforeEach(async () => {
    // Re-seed data for Specialty tests
    await sequelize.query('TRUNCATE TABLE specialties RESTART IDENTITY CASCADE;');
    await sequelize.query(`
      INSERT INTO specialties (id, name) VALUES
      (1, 'radiology'),
      (2, 'surgery'),
      (3, 'dentistry');
    `);
  });

  it('should create a specialty', async () => {
    const newSpecialty = await Specialty.create({ name: 'oncology' });
    expect(newSpecialty).to.have.property('id').that.is.a('number');
    expect(newSpecialty.name).to.equal('oncology');
  });

  it('should find a specialty by ID', async () => {
    const specialty = await Specialty.findByPk(1);
    expect(specialty).to.exist;
    expect(specialty.name).to.equal('radiology');
  });

  it('should update a specialty', async () => {
    const specialty = await Specialty.findByPk(1);
    await specialty.update({ name: 'cardiology' });
    expect(specialty.name).to.equal('cardiology');
  });

  it('should delete a specialty', async () => {
    await Specialty.destroy({ where: { id: 1 } });
    const specialty = await Specialty.findByPk(1);
    expect(specialty).to.be.null;
  });

  it('should correctly identify if a specialty is new', async () => {
    const specialty = new Specialty();
    expect(specialty.isNew()).to.be.true;
    const existingSpecialty = await Specialty.findByPk(1);
    expect(existingSpecialty.isNew()).to.be.false;
  });

  it('should enforce unique names for specialties', async () => {
    try {
      await Specialty.create({ name: 'surgery' }); // Try to create a duplicate
      expect.fail('Should have thrown a unique constraint error');
    } catch (error) {
      expect(error.name).to.equal('SequelizeUniqueConstraintError');
    }
  });

  it('should return the name from toString()', async () => {
    const specialty = await Specialty.findByPk(1);
    expect(specialty.toString()).to.equal('radiology');
  });

  it('should return "<null>" from toString() if name is null', () => {
    const specialty = new Specialty();
    specialty.name = null;
    expect(specialty.toString()).to.equal('<null>');
  });
});
