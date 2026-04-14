// test/models/vet.test.js
const { expect } = require('chai');
const { sequelize, models } = require('../../test/config/testDb');
const { Vet, Specialty } = models;

describe('Vet Model', () => {
  beforeEach(async () => {
    // Re-seed necessary data for each test
    await sequelize.query('TRUNCATE TABLE vets, specialties, vet_specialties RESTART IDENTITY CASCADE;');
    await sequelize.query(`
      INSERT INTO vets (id, first_name, last_name) VALUES
      (1, 'James', 'Carter'),
      (2, 'Helen', 'Leary');
    `);
    await sequelize.query(`
      INSERT INTO specialties (id, name) VALUES
      (1, 'radiology'),
      (2, 'surgery'),
      (3, 'dentistry');
    `);
    await sequelize.query(`
      INSERT INTO vet_specialties (vet_id, specialty_id) VALUES
      (2, 1), -- Helen Leary has radiology
      (2, 2); -- Helen Leary has surgery
    `);
  });

  it('should create a vet', async () => {
    const newVet = await Vet.create({
      firstName: 'Linda',
      lastName: 'Douglas'
    });
    expect(newVet).to.have.property('id').that.is.a('number');
    expect(newVet.firstName).to.equal('Linda');
  });

  it('should find a vet by ID', async () => {
    const vet = await Vet.findByPk(1);
    expect(vet).to.exist;
    expect(vet.firstName).to.equal('James');
  });

  it('should update a vet', async () => {
    const vet = await Vet.findByPk(1);
    await vet.update({ firstName: 'Jim' });
    expect(vet.firstName).to.equal('Jim');
  });

  it('should delete a vet', async () => {
    await Vet.destroy({ where: { id: 1 } });
    const vet = await Vet.findByPk(1);
    expect(vet).to.be.null;
  });

  it('should correctly identify if a vet is new', async () => {
    const vet = new Vet();
    expect(vet.isNew()).to.be.true;
    const existingVet = await Vet.findByPk(1);
    expect(existingVet.isNew()).to.be.false;
  });

  describe('Associations and Custom Methods', () => {
    it('should include specialties when fetching a vet', async () => {
      const vet = await Vet.findByPk(2, {
        include: [{ model: Specialty, as: 'specialties' }]
      });
      expect(vet).to.exist;
      expect(vet.specialties).to.be.an('array').with.lengthOf(2);
      expect(vet.specialties.map(s => s.name)).to.include.members(['radiology', 'surgery']);
    });

    it('getSpecialties() should return specialties sorted by name', async () => {
      const vet = await Vet.findByPk(2, {
        include: [{ model: Specialty, as: 'specialties' }]
      });
      const sortedSpecialties = vet.getSpecialties();
      expect(sortedSpecialties.map(s => s.name)).to.deep.equal(['radiology', 'surgery']);
    });

    it('getSpecialties() should return an empty array if no specialties', async () => {
      const vet = await Vet.findByPk(1, {
        include: [{ model: Specialty, as: 'specialties' }]
      });
      expect(vet.getSpecialties()).to.be.an('array').with.lengthOf(0);
    });

    it('getNrOfSpecialties() should return the correct count', async () => {
      const vet = await Vet.findByPk(2, {
        include: [{ model: Specialty, as: 'specialties' }]
      });
      expect(vet.getNrOfSpecialties()).to.equal(2);
    });

    it('getNrOfSpecialties() should return 0 if no specialties', async () => {
      const vet = await Vet.findByPk(1, {
        include: [{ model: Specialty, as: 'specialties' }]
      });
      expect(vet.getNrOfSpecialties()).to.equal(0);
    });

    it('addSpecialty should add a transient specialty', () => {
      const vet = new Vet({ firstName: 'Test', lastName: 'Vet' });
      const newSpecialty = new Specialty({ name: 'dermatology' });
      vet.addSpecialty(newSpecialty);
      expect(vet.specialties).to.have.lengthOf(1);
      expect(vet.specialties[0].name).to.equal('dermatology');
    });
  });
});
