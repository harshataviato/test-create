const Vet = require('../../models/vet.model');
const Specialty = require('../../models/specialty.model');
const { getSequelize, authenticate, sync } = require('../../config/database');

const sequelize = getSequelize();

describe('Vet Model', () => {
  let vet1, specialty1, specialty2;

  beforeAll(async () => {
    await authenticate();
    await sync({ force: true });
  });

  afterAll(async () => {
    await sync({ force: true });
  });

  beforeEach(async () => {
    await Vet.destroy({ truncate: true, restartIdentity: true });
    await Specialty.destroy({ truncate: true, restartIdentity: true });
    await sequelize.query('TRUNCATE TABLE vet_specialties RESTART IDENTITY CASCADE;');

    vet1 = await Vet.create({ firstName: 'James', lastName: 'Carter' });
    specialty1 = await Specialty.create({ name: 'Radiology' });
    specialty2 = await Specialty.create({ name: 'Surgery' });

    await vet1.addSpecialty(specialty1);
    await vet1.addSpecialty(specialty2);
  });

  test('should create a vet successfully', async () => {
    const vet = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
    expect(vet).toBeDefined();
    expect(vet.id).toBeDefined();
    expect(vet.firstName).toBe('Helen');
    expect(vet.lastName).toBe('Leary');
  });

  test('should retrieve a vet by ID with specialties', async () => {
    const foundVet = await Vet.findByPk(vet1.id, { include: [{ model: Specialty, as: 'specialties' }] });
    expect(foundVet).toBeDefined();
    expect(foundVet.id).toBe(vet1.id);
    expect(foundVet.firstName).toBe('James');
    expect(foundVet.lastName).toBe('Carter');
    expect(foundVet.specialties).toBeDefined();
    expect(foundVet.specialties.length).toBe(2);
    expect(foundVet.specialties.map(s => s.name)).toEqual(expect.arrayContaining(['Radiology', 'Surgery']));
  });

  test('should update a vet', async () => {
    vet1.firstName = 'Jim';
    await vet1.save();
    const updatedVet = await Vet.findByPk(vet1.id);
    expect(updatedVet.firstName).toBe('Jim');
  });

  test('should delete a vet', async () => {
    await Vet.destroy({ where: { id: vet1.id } });
    const foundVet = await Vet.findByPk(vet1.id);
    expect(foundVet).toBeNull();
  });

  test('should require first and last name', async () => {
    await expect(Vet.create({ lastName: 'Doe' })).rejects.toThrow();
    await expect(Vet.create({ firstName: 'John' })).rejects.toThrow();
  });

  test('should have isNew() method inherited from BaseEntity', async () => {
    const newVet = Vet.build({ firstName: 'New', lastName: 'Vet' });
    expect(newVet.isNew()).toBe(true);

    const savedVet = await Vet.create({ firstName: 'Saved', lastName: 'Vet' });
    expect(savedVet.isNew()).toBe(false);
  });

  test('getSpecialties() should return sorted specialties', async () => {
    const fetchedVet = await Vet.findByPk(vet1.id, { include: [{ model: Specialty, as: 'specialties' }] });
    const sortedSpecialties = fetchedVet.getSpecialties();
    expect(sortedSpecialties.length).toBe(2);
    expect(sortedSpecialties[0].name).toBe('Radiology'); // 'Radiology' comes before 'Surgery' alphabetically
    expect(sortedSpecialties[1].name).toBe('Surgery');
  });

  test('getNrOfSpecialties() should return the correct count', async () => {
    const fetchedVet = await Vet.findByPk(vet1.id, { include: [{ model: Specialty, as: 'specialties' }] });
    expect(fetchedVet.getNrOfSpecialties()).toBe(2);

    const vetWithoutSpecialties = await Vet.create({ firstName: 'No', lastName: 'Spec' });
    const fetchedVetWithoutSpec = await Vet.findByPk(vetWithoutSpecialties.id, { include: [{ model: Specialty, as: 'specialties' }] });
    expect(fetchedVetWithoutSpec.getNrOfSpecialties()).toBe(0);
  });

  test('addSpecialty() should add specialty to in-memory list', async () => {
    const fetchedVet = await Vet.findByPk(vet1.id, { include: [{ model: Specialty, as: 'specialties' }] });
    const specialty3 = Specialty.build({ name: 'Ophtalmology' });
    fetchedVet.addSpecialty(specialty3);
    expect(fetchedVet.specialties.length).toBe(3);
    expect(fetchedVet.specialties.map(s => s.name)).toContain('Ophtalmology');
  });
});
