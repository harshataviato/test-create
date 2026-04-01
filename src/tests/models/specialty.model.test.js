const Specialty = require('../../models/specialty.model');
const { getSequelize, authenticate, sync } = require('../../config/database');

const sequelize = getSequelize();

describe('Specialty Model', () => {
  beforeAll(async () => {
    await authenticate();
    await sync({ force: true });
  });

  afterAll(async () => {
    await sync({ force: true });
  });

  beforeEach(async () => {
    await Specialty.destroy({ truncate: true, restartIdentity: true });
  });

  test('should create a specialty successfully', async () => {
    const specialty = await Specialty.create({ name: 'Radiology' });
    expect(specialty).toBeDefined();
    expect(specialty.id).toBeDefined();
    expect(specialty.name).toBe('Radiology');
  });

  test('should retrieve a specialty by ID', async () => {
    const createdSpecialty = await Specialty.create({ name: 'Surgery' });
    const foundSpecialty = await Specialty.findByPk(createdSpecialty.id);
    expect(foundSpecialty).toBeDefined();
    expect(foundSpecialty.id).toBe(createdSpecialty.id);
    expect(foundSpecialty.name).toBe('Surgery');
  });

  test('should update a specialty', async () => {
    const specialty = await Specialty.create({ name: 'Dentistry' });
    specialty.name = 'Advanced Dentistry';
    await specialty.save();
    const updatedSpecialty = await Specialty.findByPk(specialty.id);
    expect(updatedSpecialty.name).toBe('Advanced Dentistry');
  });

  test('should delete a specialty', async () => {
    const specialty = await Specialty.create({ name: 'Dermatology' });
    await Specialty.destroy({ where: { id: specialty.id } });
    const foundSpecialty = await Specialty.findByPk(specialty.id);
    expect(foundSpecialty).toBeNull();
  });

  test('should require a name', async () => {
    await expect(Specialty.create({})).rejects.toThrow();
    await expect(Specialty.create({ name: '' })).rejects.toThrow();
    await expect(Specialty.create({ name: null })).rejects.toThrow();
  });

  test('should have isNew() method inherited from BaseEntity', async () => {
    const newSpecialty = Specialty.build({ name: 'New Specialty' });
    expect(newSpecialty.isNew()).toBe(true);

    const savedSpecialty = await Specialty.create({ name: 'Saved Specialty' });
    expect(savedSpecialty.isNew()).toBe(false);

    const fetchedSpecialty = await Specialty.findByPk(savedSpecialty.id);
    expect(fetchedSpecialty.isNew()).toBe(false);
  });

  test('should have toString() method inherited from NamedEntity', async () => {
    const specialty = Specialty.build({ name: 'Cardiology' });
    expect(specialty.toString()).toBe('Cardiology');
  });
});
