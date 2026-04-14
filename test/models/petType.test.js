// test/models/petType.test.js
const { expect } = require('chai');
const { sequelize, models } = require('../../test/config/testDb');
const { PetType } = models;

describe('PetType Model', () => {
  beforeEach(async () => {
    // Re-seed data for PetType tests
    await sequelize.query('TRUNCATE TABLE types RESTART IDENTITY CASCADE;');
    await sequelize.query(`
      INSERT INTO types (id, name) VALUES
      (1, 'cat'),
      (2, 'dog'),
      (3, 'snake');
    `);
  });

  it('should create a pet type', async () => {
    const newType = await PetType.create({ name: 'bird' });
    expect(newType).to.have.property('id').that.is.a('number');
    expect(newType.name).to.equal('bird');
  });

  it('should find a pet type by ID', async () => {
    const petType = await PetType.findByPk(1);
    expect(petType).to.exist;
    expect(petType.name).to.equal('cat');
  });

  it('should update a pet type', async () => {
    const petType = await PetType.findByPk(1);
    await petType.update({ name: 'feline' });
    expect(petType.name).to.equal('feline');
  });

  it('should delete a pet type', async () => {
    await PetType.destroy({ where: { id: 1 } });
    const petType = await PetType.findByPk(1);
    expect(petType).to.be.null;
  });

  it('should correctly identify if a pet type is new', async () => {
    const petType = new PetType();
    expect(petType.isNew()).to.be.true;
    const existingPetType = await PetType.findByPk(1);
    expect(existingPetType.isNew()).to.be.false;
  });

  it('should enforce unique names for pet types', async () => {
    try {
      await PetType.create({ name: 'dog' }); // Try to create a duplicate
      expect.fail('Should have thrown a unique constraint error');
    } catch (error) {
      expect(error.name).to.equal('SequelizeUniqueConstraintError');
    }
  });

  it('should return the name from toString()', async () => {
    const petType = await PetType.findByPk(1);
    expect(petType.toString()).to.equal('cat');
  });

  it('should return "<null>" from toString() if name is null', () => {
    const petType = new PetType();
    petType.name = null;
    expect(petType.toString()).to.equal('<null>');
  });
});
