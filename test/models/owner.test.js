// test/models/owner.test.js
const { expect } = require('chai');
const { sequelize, models } = require('../../test/config/testDb');
const { Owner, Pet, PetType, Visit } = models;
const moment = require('moment');

describe('Owner Model', () => {
  beforeEach(async () => {
    // Re-seed the database for each test to ensure a clean state
    await sequelize.query('TRUNCATE TABLE owners, pets, types, visits RESTART IDENTITY CASCADE;');
    await sequelize.query(`
      INSERT INTO owners (id, first_name, last_name, address, city, telephone) VALUES
      (1, 'George', 'Franklin', '110 W. Liberty St.', 'Madison', '6085551023'),
      (2, 'Betty', 'Davis', '638 Cardinal Ave.', 'Sun Prairie', '6085551749');
    `);
    await sequelize.query(`
      INSERT INTO types (id, name) VALUES (1, 'cat'), (2, 'dog');
    `);
    await sequelize.query(`
      INSERT INTO pets (id, name, birth_date, type_id, owner_id) VALUES
      (1, 'Leo', '2000-09-07', 1, 1),
      (2, 'Max', '2001-01-15', 2, 1),
      (3, 'Rosy', '2002-03-20', 2, 2);
    `);
    await sequelize.query(`
      INSERT INTO visits (id, pet_id, visit_date, description) VALUES
      (1, 1, '2010-03-04', 'rabies shot'),
      (2, 1, '2011-04-05', 'checkup'),
      (3, 2, '2012-01-01', 'vaccination');
    `);
  });

  it('should create an owner', async () => {
    const newOwner = await Owner.create({
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Anytown',
      telephone: '1234567890'
    });
    expect(newOwner).to.have.property('id').that.is.a('number');
    expect(newOwner.firstName).to.equal('John');
  });

  it('should find an owner by ID', async () => {
    const owner = await Owner.findByPk(1);
    expect(owner).to.exist;
    expect(owner.firstName).to.equal('George');
  });

  it('should update an owner', async () => {
    const owner = await Owner.findByPk(1);
    await owner.update({ telephone: '9876543210' });
    expect(owner.telephone).to.equal('9876543210');
  });

  it('should delete an owner', async () => {
    await Owner.destroy({ where: { id: 1 } });
    const owner = await Owner.findByPk(1);
    expect(owner).to.be.null;
  });

  it('should correctly identify if an owner is new', async () => {
    const owner = new Owner();
    expect(owner.isNew()).to.be.true;
    const existingOwner = await Owner.findByPk(1);
    expect(existingOwner.isNew()).to.be.false;
  });

  describe('Associations', () => {
    it('should include pets when fetching an owner', async () => {
      const owner = await Owner.findByPk(1, {
        include: [{ model: Pet, as: 'pets' }]
      });
      expect(owner).to.exist;
      expect(owner.pets).to.be.an('array').with.lengthOf(2);
      expect(owner.pets[0].name).to.be.oneOf(['Leo', 'Max']);
    });

    it('should include pets and their types and visits when fetching an owner', async () => {
      const owner = await Owner.findByPk(1, {
        include: [{
          model: Pet,
          as: 'pets',
          include: [
            { model: PetType, as: 'type' },
            { model: Visit, as: 'visits' }
          ]
        }],
        order: [
          [{ model: Pet, as: 'pets' }, 'name', 'ASC'],
          [{ model: Pet, as: 'pets' }, { model: Visit, as: 'visits' }, 'visit_date', 'ASC'] // Use snake_case for order by field
        ]
      });

      expect(owner).to.exist;
      expect(owner.pets).to.be.an('array').with.lengthOf(2);

      const leo = owner.pets.find(p => p.name === 'Leo');
      expect(leo).to.exist;
      expect(leo.type.name).to.equal('cat');
      expect(leo.visits).to.be.an('array').with.lengthOf(2);
      expect(moment(leo.visits[0].visitDate).format('YYYY-MM-DD')).to.equal('2010-03-04');
      expect(moment(leo.visits[1].visitDate).format('YYYY-MM-DD')).to.equal('2011-04-05');
    });
  });

  describe('Custom Methods', () => {
    let ownerWithPets;

    beforeEach(async () => {
      ownerWithPets = await Owner.findByPk(1, {
        include: [{
          model: Pet,
          as: 'pets',
          include: [{ model: Visit, as: 'visits' }]
        }]
      });
    });

    it('should get a pet by name (case-insensitive)', () => {
      const pet = ownerWithPets.getPetByName('leo');
      expect(pet).to.exist;
      expect(pet.name).to.equal('Leo');
    });

    it('should return null if pet name not found', () => {
      const pet = ownerWithPets.getPetByName('nonexistent');
      expect(pet).to.be.null;
    });

    it('should get a pet by ID', () => {
      const pet = ownerWithPets.getPetById(2); // Max
      expect(pet).to.exist;
      expect(pet.name).to.equal('Max');
    });

    it('should return null if pet ID not found', () => {
      const pet = ownerWithPets.getPetById(99);
      expect(pet).to.be.null;
    });

    it('should add a new (transient) pet to the owner', () => {
      const newPet = new Pet({ name: 'Buddy', birthDate: '2023-01-01', typeId: 1 });
      ownerWithPets.addPet(newPet);
      expect(ownerWithPets.pets).to.have.lengthOf(3);
      expect(ownerWithPets.getPetByName('Buddy')).to.exist;
    });

    it('should add a visit to an existing pet', () => {
      const petId = ownerWithPets.pets[0].id; // Leo's ID
      const newVisit = new Visit({ visitDate: '2024-01-01', description: 'Annual checkup' });
      ownerWithPets.addVisit(petId, newVisit);
      const pet = ownerWithPets.getPetById(petId);
      expect(pet.visits).to.have.lengthOf(3);
      expect(pet.visits[2].description).to.equal('Annual checkup');
    });

    it('should throw error when adding visit to null petId', () => {
      const newVisit = new Visit({ visitDate: '2024-01-01', description: 'Annual checkup' });
      expect(() => ownerWithPets.addVisit(null, newVisit)).to.throw('Pet identifier must not be null!');
    });

    it('should throw error when adding null visit', () => {
      const petId = ownerWithPets.pets[0].id;
      expect(() => ownerWithPets.addVisit(petId, null)).to.throw('Visit must not be null!');
    });

    it('should throw error when adding visit to invalid petId', () => {
      const newVisit = new Visit({ visitDate: '2024-01-01', description: 'Annual checkup' });
      expect(() => ownerWithPets.addVisit(999, newVisit)).to.throw('Invalid Pet identifier!');
    });

    it('should return a string representation of the owner', () => {
      expect(ownerWithPets.toString()).to.include('Owner(id=1, new=false, lastName=Franklin, firstName=George');
    });
  });
});
