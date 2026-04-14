// test/models/visit.test.js
const { expect } = require('chai');
const { sequelize, models } = require('../../test/config/testDb');
const { Visit, Pet, PetType, Owner } = models;
const moment = require('moment');

describe('Visit Model', () => {
  beforeEach(async () => {
    // Re-seed necessary data for each test
    await sequelize.query('TRUNCATE TABLE owners, pets, types, visits RESTART IDENTITY CASCADE;');
    await sequelize.query(`
      INSERT INTO owners (id, first_name, last_name, address, city, telephone) VALUES
      (1, 'George', 'Franklin', '110 W. Liberty St.', 'Madison', '6085551023');
    `);
    await sequelize.query(`
      INSERT INTO types (id, name) VALUES (1, 'cat');
    `);
    await sequelize.query(`
      INSERT INTO pets (id, name, birth_date, type_id, owner_id) VALUES
      (1, 'Leo', '2000-09-07', 1, 1);
    `);
    await sequelize.query(`
      INSERT INTO visits (id, pet_id, visit_date, description) VALUES
      (1, 1, '2010-03-04', 'rabies shot'),
      (2, 1, '2011-04-05', 'checkup');
    `);
  });

  it('should create a visit', async () => {
    const newVisit = await Visit.create({
      petId: 1,
      visitDate: '2023-01-01',
      description: 'Annual exam'
    });
    expect(newVisit).to.have.property('id').that.is.a('number');
    expect(newVisit.description).to.equal('Annual exam');
    expect(newVisit.visitDate).to.equal('2023-01-01');
  });

  it('should set visitDate to current date by default if not provided', async () => {
    const newVisit = await Visit.create({
      petId: 1,
      description: 'Default date visit'
    });
    expect(newVisit).to.have.property('id').that.is.a('number');
    // Check if the default value is close to now, considering potential tiny delays
    const today = moment().format('YYYY-MM-DD');
    expect(newVisit.visitDate).to.equal(today);
  });

  it('should find a visit by ID', async () => {
    const visit = await Visit.findByPk(1);
    expect(visit).to.exist;
    expect(visit.description).to.equal('rabies shot');
  });

  it('should update a visit', async () => {
    const visit = await Visit.findByPk(1);
    await visit.update({ description: 'new rabies shot' });
    expect(visit.description).to.equal('new rabies shot');
  });

  it('should delete a visit', async () => {
    await Visit.destroy({ where: { id: 1 } });
    const visit = await Visit.findByPk(1);
    expect(visit).to.be.null;
  });

  it('should correctly identify if a visit is new', async () => {
    const visit = new Visit();
    expect(visit.isNew()).to.be.true;
    const existingVisit = await Visit.findByPk(1);
    expect(existingVisit.isNew()).to.be.false;
  });

  describe('Associations', () => {
    it('should include pet, pet type, and owner when fetching a visit', async () => {
      const visit = await Visit.findByPk(1, {
        include: [{
          model: Pet,
          as: 'pet',
          include: [{ model: PetType, as: 'type' }, { model: Owner, as: 'owner' }]
        }]
      });
      expect(visit).to.exist;
      expect(visit.pet).to.exist;
      expect(visit.pet.name).to.equal('Leo');
      expect(visit.pet.type.name).to.equal('cat');
      expect(visit.pet.owner.lastName).to.equal('Franklin');
    });
  });

  describe('Custom Getters/Setters', () => {
    it('date getter should return visitDate', async () => {
      const visit = await Visit.findByPk(1);
      expect(visit.date).to.equal(visit.visitDate);
    });

    it('date setter should set visitDate', () => {
      const visit = new Visit();
      visit.date = '2023-06-15';
      expect(visit.visitDate).to.equal('2023-06-15');
    });
  });
});
