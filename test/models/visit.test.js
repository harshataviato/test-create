/**
 * @module test/models/visit
 * @description Tests for the Visit model.
 */

const db = require('../../config/database');
const moment = require('moment');

describe('Visit Model', () => {
  let owner, petType, pet;

  beforeEach(async () => {
    await db.sequelize.sync({ force: true });
    owner = await db.Owner.create({
      firstName: 'Charlie',
      lastName: 'Brown',
      address: 'Doghouse',
      city: 'Cartoonville',
      telephone: '4445556666'
    });
    petType = await db.PetType.create({ name: 'Beagle' });
    pet = await db.Pet.create({
      name: 'Snoopy',
      birthDate: moment('1950-10-02').toDate(),
      typeId: petType.id,
      ownerId: owner.id
    });
  });

  it('should create a new visit successfully', async () => {
    const visit = await db.Visit.create({
      petId: pet.id,
      visitDate: moment('2023-01-15').toDate(),
      description: 'Annual check-up and vaccinations'
    });

    expect(visit).to.be.an('object');
    expect(visit.id).to.exist;
    expect(visit.petId).to.equal(pet.id);
    expect(visit.visitDate).to.be.a('date');
    expect(moment(visit.visitDate).format('YYYY-MM-DD')).to.equal('2023-01-15');
    expect(visit.description).to.equal('Annual check-up and vaccinations');
  });

  it('should retrieve a visit by ID', async () => {
    const createdVisit = await db.Visit.create({
      petId: pet.id,
      visitDate: moment('2022-11-20').toDate(),
      description: 'Dental cleaning'
    });

    const foundVisit = await db.Visit.findByPk(createdVisit.id);

    expect(foundVisit).to.be.an('object');
    expect(foundVisit.id).to.equal(createdVisit.id);
    expect(foundVisit.description).to.equal('Dental cleaning');
  });

  it('should update a visit', async () => {
    const visit = await db.Visit.create({
      petId: pet.id,
      visitDate: moment('2023-03-01').toDate(),
      description: 'Initial visit'
    });

    await visit.update({ description: 'Follow-up on initial visit', visitDate: moment('2023-03-15').toDate() });

    const updatedVisit = await db.Visit.findByPk(visit.id);
    expect(updatedVisit.description).to.equal('Follow-up on initial visit');
    expect(moment(updatedVisit.visitDate).format('YYYY-MM-DD')).to.equal('2023-03-15');
  });

  it('should delete a visit', async () => {
    const visit = await db.Visit.create({
      petId: pet.id,
      visitDate: moment('2021-07-01').toDate(),
      description: 'Emergency visit'
    });

    await visit.destroy();

    const foundVisit = await db.Visit.findByPk(visit.id);
    expect(foundVisit).to.be.null;
  });

  // --- Validation Tests ---

  it('should require petId', async () => {
    try {
      await db.Visit.create({
        visitDate: moment('2023-01-01').toDate(),
        description: 'Missing pet ID'
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Pet ID is required for a visit.');
    }
  });

  it('should require visitDate', async () => {
    try {
      await db.Visit.create({
        petId: pet.id,
        description: 'Missing visit date'
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Visit date must be a valid date.');
    }
  });

  it('should validate visitDate is a valid date', async () => {
    try {
      await db.Visit.create({
        petId: pet.id,
        visitDate: 'not-a-date',
        description: 'Invalid date format'
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Visit date must be a valid date.');
    }
  });

  it('should not allow visitDate in the future', async () => {
    try {
      const futureDate = moment().add(1, 'days').toDate();
      await db.Visit.create({
        petId: pet.id,
        visitDate: futureDate,
        description: 'Future visit'
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Visit date cannot be in the future.');
    }
  });

  it('should require description', async () => {
    try {
      await db.Visit.create({
        petId: pet.id,
        visitDate: moment('2023-01-01').toDate()
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Visit description is required.');
    }
  });

  it('should validate description length (min 3)', async () => {
    try {
      await db.Visit.create({
        petId: pet.id,
        visitDate: moment('2023-01-01').toDate(),
        description: 'ab' // Too short
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Description must be between 3 and 255 characters.');
    }
  });

  it('should validate description length (max 255)', async () => {
    try {
      await db.Visit.create({
        petId: pet.id,
        visitDate: moment('2023-01-01').toDate(),
        description: 'a'.repeat(256) // Too long
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Description must be between 3 and 255 characters.');
    }
  });

  // --- Association Tests ---

  it('should be associated with a Pet', async () => {
    const visit = await db.Visit.create({
      petId: pet.id,
      visitDate: moment('2023-01-01').toDate(),
      description: 'Associated visit'
    });

    const visitWithPet = await db.Visit.findByPk(visit.id, {
      include: [{ model: db.Pet, as: 'pet' }]
    });

    expect(visitWithPet.pet).to.exist;
    expect(visitWithPet.pet.id).to.equal(pet.id);
  });

  it('should be deleted when its pet is deleted (CASCADE)', async () => {
    const visit = await db.Visit.create({
      petId: pet.id,
      visitDate: moment('2020-01-01').toDate(),
      description: 'Visit to be cascade deleted'
    });

    await pet.destroy(); // Delete the pet

    const foundVisit = await db.Visit.findByPk(visit.id);
    expect(foundVisit).to.be.null;
  });
});

