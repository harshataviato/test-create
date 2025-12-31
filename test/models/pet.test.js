/**
 * @module test/models/pet
 * @description Tests for the Pet model.
 */

const db = require('../../config/database');
const moment = require('moment');

describe('Pet Model', () => {
  let owner, petType;

  beforeEach(async () => {
    await db.sequelize.sync({ force: true });
    owner = await db.Owner.create({
      firstName: 'Alice',
      lastName: 'Wonderland',
      address: 'Rabbit Hole',
      city: 'Wonderland',
      telephone: '1112223333'
    });
    petType = await db.PetType.create({ name: 'Dog' });
  });

  it('should create a new pet successfully', async () => {
    const pet = await db.Pet.create({
      name: 'Buddy',
      birthDate: moment('2015-03-01').toDate(),
      typeId: petType.id,
      ownerId: owner.id
    });

    expect(pet).to.be.an('object');
    expect(pet.id).to.exist;
    expect(pet.name).to.equal('Buddy');
    expect(pet.birthDate).to.be.a('date');
    expect(moment(pet.birthDate).format('YYYY-MM-DD')).to.equal('2015-03-01');
    expect(pet.typeId).to.equal(petType.id);
    expect(pet.ownerId).to.equal(owner.id);
  });

  it('should retrieve a pet by ID', async () => {
    const createdPet = await db.Pet.create({
      name: 'Fido',
      birthDate: moment('2018-06-15').toDate(),
      typeId: petType.id,
      ownerId: owner.id
    });

    const foundPet = await db.Pet.findByPk(createdPet.id);

    expect(foundPet).to.be.an('object');
    expect(foundPet.id).to.equal(createdPet.id);
    expect(foundPet.name).to.equal('Fido');
  });

  it('should update a pet', async () => {
    const pet = await db.Pet.create({
      name: 'OldName',
      birthDate: moment('2010-01-01').toDate(),
      typeId: petType.id,
      ownerId: owner.id
    });

    await pet.update({ name: 'NewName', birthDate: moment('2011-02-02').toDate() });

    const updatedPet = await db.Pet.findByPk(pet.id);
    expect(updatedPet.name).to.equal('NewName');
    expect(moment(updatedPet.birthDate).format('YYYY-MM-DD')).to.equal('2011-02-02');
  });

  it('should delete a pet', async () => {
    const pet = await db.Pet.create({
      name: 'DeleteMe',
      birthDate: moment('2020-01-01').toDate(),
      typeId: petType.id,
      ownerId: owner.id
    });

    await pet.destroy();

    const foundPet = await db.Pet.findByPk(pet.id);
    expect(foundPet).to.be.null;
  });

  // --- Validation Tests ---

  it('should require name', async () => {
    try {
      await db.Pet.create({
        birthDate: moment('2015-03-01').toDate(),
        typeId: petType.id,
        ownerId: owner.id
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Pet name is required.');
    }
  });

  it('should require birthDate', async () => {
    try {
      await db.Pet.create({
        name: 'Buddy',
        typeId: petType.id,
        ownerId: owner.id
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Birth date must be a valid date.');
    }
  });

  it('should validate birthDate is a valid date', async () => {
    try {
      await db.Pet.create({
        name: 'Buddy',
        birthDate: 'invalid-date',
        typeId: petType.id,
        ownerId: owner.id
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Birth date must be a valid date.');
    }
  });

  it('should not allow birthDate in the future', async () => {
    try {
      const futureDate = moment().add(1, 'days').toDate();
      await db.Pet.create({
        name: 'FuturePet',
        birthDate: futureDate,
        typeId: petType.id,
        ownerId: owner.id
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Birth date cannot be in the future.');
    }
  });

  it('should require typeId', async () => {
    try {
      await db.Pet.create({
        name: 'Buddy',
        birthDate: moment('2015-03-01').toDate(),
        ownerId: owner.id
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Pet type is required.');
    }
  });

  it('should validate typeId is an integer', async () => {
    try {
      await db.Pet.create({
        name: 'Buddy',
        birthDate: moment('2015-03-01').toDate(),
        typeId: 'not-an-int',
        ownerId: owner.id
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Invalid pet type.');
    }
  });

  it('should require ownerId', async () => {
    try {
      await db.Pet.create({
        name: 'Buddy',
        birthDate: moment('2015-03-01').toDate(),
        typeId: petType.id
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Owner is required.');
    }
  });

  it('should validate ownerId is an integer', async () => {
    try {
      await db.Pet.create({
        name: 'Buddy',
        birthDate: moment('2015-03-01').toDate(),
        typeId: petType.id,
        ownerId: 'not-an-int'
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Invalid owner ID.');
    }
  });

  // --- Association Tests ---

  it('should be associated with an Owner', async () => {
    const pet = await db.Pet.create({
      name: 'AssociatedPet',
      birthDate: moment('2019-01-01').toDate(),
      typeId: petType.id,
      ownerId: owner.id
    });

    const petWithOwner = await db.Pet.findByPk(pet.id, {
      include: [{ model: db.Owner, as: 'owner' }]
    });

    expect(petWithOwner.owner).to.exist;
    expect(petWithOwner.owner.id).to.equal(owner.id);
  });

  it('should be associated with a PetType', async () => {
    const pet = await db.Pet.create({
      name: 'AssociatedPetType',
      birthDate: moment('2019-01-01').toDate(),
      typeId: petType.id,
      ownerId: owner.id
    });

    const petWithType = await db.Pet.findByPk(pet.id, {
      include: [{ model: db.PetType, as: 'type' }]
    });

    expect(petWithType.type).to.exist;
    expect(petWithType.type.id).to.equal(petType.id);
    expect(petWithType.type.name).to.equal('Dog');
  });

  it('should be deleted when its owner is deleted (CASCADE)', async () => {
    const pet = await db.Pet.create({
      name: 'CascadeDeletePet',
      birthDate: moment('2020-01-01').toDate(),
      typeId: petType.id,
      ownerId: owner.id
    });

    await owner.destroy(); // Delete the owner

    const foundPet = await db.Pet.findByPk(pet.id);
    expect(foundPet).to.be.null;
  });

  it('should restrict deletion of PetType if pets exist', async () => {
    await db.Pet.create({
      name: 'PetWithProtectedType',
      birthDate: moment('2020-01-01').toDate(),
      typeId: petType.id,
      ownerId: owner.id
    });

    try {
      await petType.destroy();
      expect.fail('Expected SequelizeForeignKeyConstraintError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeForeignKeyConstraintError');
      // The exact error message might vary slightly between database dialects,
      // but the error type should be consistent.
    }
  });
});

