// test/models/pet.test.js
const { expect } = require('chai');
const { sequelize, models } = require('../../test/config/testDb');
const { Pet, Owner, PetType, Visit } = models;
const moment = require('moment');

describe('Pet Model', () => {
  beforeEach(async () => {
    // Re-seed necessary data for each test
    await sequelize.query('TRUNCATE TABLE owners, pets, types, visits RESTART IDENTITY CASCADE;');
    await sequelize.query(`
      INSERT INTO owners (id, first_name, last_name, address, city, telephone) VALUES
      (1, 'George', 'Franklin', '110 W. Liberty St.', 'Madison', '6085551023');
    `);
    await sequelize.query(`
      INSERT INTO types (id, name) VALUES (1, 'cat'), (2, 'dog');
    `);
    await sequelize.query(`
      INSERT INTO pets (id, name, birth_date, type_id, owner_id) VALUES
      (1, 'Leo', '2000-09-07', 1, 1),
      (2, 'Max', '2001-01-15', 2, 1);
    `);
    await sequelize.query(`
      INSERT INTO visits (id, pet_id, visit_date, description) VALUES
      (1, 1, '2010-03-04', 'rabies shot'),
      (2, 1, '2011-04-05', 'checkup');
    `);
  });

  it('should create a pet', async () => {
    const newPet = await Pet.create({
      name: 'Buddy',
      birthDate: '2023-01-01',
      typeId: 2,
      ownerId: 1
    });
    expect(newPet).to.have.property('id').that.is.a('number');
    expect(newPet.name).to.equal('Buddy');
    expect(newPet.birthDate).to.equal('2023-01-01');
  });

  it('should find a pet by ID', async () => {
    const pet = await Pet.findByPk(1);
    expect(pet).to.exist;
    expect(pet.name).to.equal('Leo');
  });

  it('should update a pet', async () => {
    const pet = await Pet.findByPk(1);
    await pet.update({ name: 'Leon' });
    expect(pet.name).to.equal('Leon');
  });

  it('should delete a pet', async () => {
    await Pet.destroy({ where: { id: 1 } });
    const pet = await Pet.findByPk(1);
    expect(pet).to.be.null;
  });

  it('should correctly identify if a pet is new', async () => {
    const pet = new Pet();
    expect(pet.isNew()).to.be.true;
    const existingPet = await Pet.findByPk(1);
    expect(existingPet.isNew()).to.be.false;
  });

  describe('Associations', () => {
    it('should include owner and type when fetching a pet', async () => {
      const pet = await Pet.findByPk(1, {
        include: [{ model: Owner, as: 'owner' }, { model: PetType, as: 'type' }]
      });
      expect(pet).to.exist;
      expect(pet.owner.lastName).to.equal('Franklin');
      expect(pet.type.name).to.equal('cat');
    });

    it('should include visits when fetching a pet', async () => {
      const pet = await Pet.findByPk(1, {
        include: [{ model: Visit, as: 'visits' }],
        order: [[{ model: Visit, as: 'visits' }, 'visit_date', 'ASC']]
      });
      expect(pet).to.exist;
      expect(pet.visits).to.be.an('array').with.lengthOf(2);
      expect(pet.visits[0].description).to.equal('rabies shot');
      expect(moment(pet.visits[0].visitDate).format('YYYY-MM-DD')).to.equal('2010-03-04');
    });
  });

  describe('Custom Methods', () => {
    it('should allow adding a (transient) visit to the pet', () => {
      const pet = new Pet({ name: 'Test Pet', birthDate: '2023-01-01', typeId: 1, ownerId: 1 });
      const newVisit = new Visit({ visitDate: '2024-01-01', description: 'Test visit' });
      pet.addVisit(newVisit);
      expect(pet.visits).to.be.an('array').with.lengthOf(1);
      expect(pet.visits[0].description).to.equal('Test visit');
    });

    it('birthDate getter should return a date string in YYYY-MM-DD format', async () => {
      const pet = await Pet.findByPk(1);
      expect(pet.birthDate).to.equal('2000-09-07');
    });

    it('birthDate setter should accept a date string', async () => {
      const pet = new Pet();
      pet.birthDate = '2023-05-10';
      expect(pet.birthDate).to.equal('2023-05-10');
    });
  });
});
