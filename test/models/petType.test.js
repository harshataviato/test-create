/**
 * @module test/models/petType
 * @description Tests for the PetType model.
 */

const db = require('../../config/database');

describe('PetType Model', () => {
  beforeEach(async () => {
    await db.sequelize.sync({ force: true });
  });

  it('should create a new pet type successfully', async () => {
    const petType = await db.PetType.create({ name: 'Cat' });

    expect(petType).to.be.an('object');
    expect(petType.id).to.exist;
    expect(petType.name).to.equal('Cat');
  });

  it('should retrieve a pet type by ID', async () => {
    const createdPetType = await db.PetType.create({ name: 'Bird' });
    const foundPetType = await db.PetType.findByPk(createdPetType.id);

    expect(foundPetType).to.be.an('object');
    expect(foundPetType.id).to.equal(createdPetType.id);
    expect(foundPetType.name).to.equal('Bird');
  });

  it('should update a pet type', async () => {
    const petType = await db.PetType.create({ name: 'Reptile' });
    await petType.update({ name: 'Lizard' });

    const updatedPetType = await db.PetType.findByPk(petType.id);
    expect(updatedPetType.name).to.equal('Lizard');
  });

  it('should delete a pet type', async () => {
    const petType = await db.PetType.create({ name: 'Fish' });
    await petType.destroy();

    const foundPetType = await db.PetType.findByPk(petType.id);
    expect(foundPetType).to.be.null;
  });

  // --- Validation Tests ---

  it('should require a name', async () => {
    try {
      await db.PetType.create({}); // Missing name
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Pet type name is required.');
    }
  });

  it('should enforce unique names for pet types', async () => {
    await db.PetType.create({ name: 'Dog' });

    try {
      await db.PetType.create({ name: 'Dog' }); // Duplicate name
      expect.fail('Expected SequelizeUniqueConstraintError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeUniqueConstraintError');
    }
  });

  // --- Association Tests ---
  it('should have many pets', async () => {
    const owner = await db.Owner.create({
      firstName: 'Alice',
      lastName: 'Wonderland',
      address: 'Rabbit Hole',
      city: 'Wonderland',
      telephone: '1112223333'
    });
    const typeDog = await db.PetType.create({ name: 'Dog' });
    const typeCat = await db.PetType.create({ name: 'Cat' });

    await db.Pet.create({ name: 'Buddy', birthDate: '2015-01-01', typeId: typeDog.id, ownerId: owner.id });
    await db.Pet.create({ name: 'Lucy', birthDate: '2016-01-01', typeId: typeDog.id, ownerId: owner.id });
    await db.Pet.create({ name: 'Whiskers', birthDate: '2017-01-01', typeId: typeCat.id, ownerId: owner.id });

    const dogTypeWithPets = await db.PetType.findByPk(typeDog.id, {
      include: [{ model: db.Pet, as: 'pets' }]
    });

    expect(dogTypeWithPets.pets).to.have.lengthOf(2);
    expect(dogTypeWithPets.pets[0].name).to.be.oneOf(['Buddy', 'Lucy']);
  });
});

