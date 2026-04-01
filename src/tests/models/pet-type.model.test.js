const PetType = require('../../models/pet-type.model');
const { getSequelize, authenticate, sync } = require('../../config/database');

const sequelize = getSequelize();

describe('PetType Model', () => {
  beforeAll(async () => {
    await authenticate();
    await sync({ force: true });
  });

  afterAll(async () => {
    await sync({ force: true });
  });

  beforeEach(async () => {
    await PetType.destroy({ truncate: true, restartIdentity: true });
  });

  test('should create a pet type successfully', async () => {
    const petType = await PetType.create({ name: 'Cat' });
    expect(petType).toBeDefined();
    expect(petType.id).toBeDefined();
    expect(petType.name).toBe('Cat');
  });

  test('should retrieve a pet type by ID', async () => {
    const createdPetType = await PetType.create({ name: 'Dog' });
    const foundPetType = await PetType.findByPk(createdPetType.id);
    expect(foundPetType).toBeDefined();
    expect(foundPetType.id).toBe(createdPetType.id);
    expect(foundPetType.name).toBe('Dog');
  });

  test('should update a pet type', async () => {
    const petType = await PetType.create({ name: 'Lizard' });
    petType.name = 'Gecko';
    await petType.save();
    const updatedPetType = await PetType.findByPk(petType.id);
    expect(updatedPetType.name).toBe('Gecko');
  });

  test('should delete a pet type', async () => {
    const petType = await PetType.create({ name: 'Snake' });
    await PetType.destroy({ where: { id: petType.id } });
    const foundPetType = await PetType.findByPk(petType.id);
    expect(foundPetType).toBeNull();
  });

  test('should require a name', async () => {
    await expect(PetType.create({})).rejects.toThrow();
    await expect(PetType.create({ name: '' })).rejects.toThrow();
    await expect(PetType.create({ name: null })).rejects.toThrow();
  });

  test('should have isNew() method inherited from BaseEntity', async () => {
    const newPetType = PetType.build({ name: 'New PetType' });
    expect(newPetType.isNew()).toBe(true);

    const savedPetType = await PetType.create({ name: 'Saved PetType' });
    expect(savedPetType.isNew()).toBe(false);

    const fetchedPetType = await PetType.findByPk(savedPetType.id);
    expect(fetchedPetType.isNew()).toBe(false);
  });

  test('should have toString() method inherited from NamedEntity', async () => {
    const petType = PetType.build({ name: 'Bird' });
    expect(petType.toString()).toBe('Bird');
  });
});
