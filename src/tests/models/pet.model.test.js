const Pet = require('../../models/pet.model');
const PetType = require('../../models/pet-type.model');
const Owner = require('../../models/owner.model');
const Visit = require('../../models/visit.model');
const { getSequelize, authenticate, sync } = require('../../config/database');
const moment = require('moment');

const sequelize = getSequelize();

describe('Pet Model', () => {
  let owner, petType, pet1;

  beforeAll(async () => {
    await authenticate();
    await sync({ force: true });
  });

  afterAll(async () => {
    await sync({ force: true });
  });

  beforeEach(async () => {
    await Visit.destroy({ truncate: true, restartIdentity: true });
    await Pet.destroy({ truncate: true, restartIdentity: true });
    await PetType.destroy({ truncate: true, restartIdentity: true });
    await Owner.destroy({ truncate: true, restartIdentity: true });

    owner = await Owner.create({
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Anytown',
      telephone: '5551234567'
    });
    petType = await PetType.create({ name: 'Dog' });
    pet1 = await Pet.create({
      name: 'Buddy',
      birthDate: '2020-01-01',
      type_id: petType.id,
      owner_id: owner.id
    });
    await Visit.create({ pet_id: pet1.id, visitDate: '2023-01-01', description: 'Annual checkup' });
    await Visit.create({ pet_id: pet1.id, visitDate: '2023-06-15', description: 'Vaccination' });
  });

  test('should create a pet successfully', async () => {
    const pet = await Pet.create({
      name: 'Lucy',
      birthDate: '2021-03-15',
      type_id: petType.id,
      owner_id: owner.id
    });
    expect(pet).toBeDefined();
    expect(pet.id).toBeDefined();
    expect(pet.name).toBe('Lucy');
    expect(pet.birthDate).toBe('2021-03-15');
    expect(pet.type_id).toBe(petType.id);
    expect(pet.owner_id).toBe(owner.id);
  });

  test('should retrieve a pet by ID with type and visits', async () => {
    const foundPet = await Pet.findByPk(pet1.id, {
      include: [
        { model: PetType, as: 'type' },
        { model: Visit, as: 'visits', order: [['date', 'ASC']] }
      ]
    });
    expect(foundPet).toBeDefined();
    expect(foundPet.id).toBe(pet1.id);
    expect(foundPet.name).toBe('Buddy');
    expect(foundPet.type).toBeDefined();
    expect(foundPet.type.name).toBe('Dog');
    expect(foundPet.visits).toBeDefined();
    expect(foundPet.visits.length).toBe(2);
    expect(foundPet.visits[0].description).toBe('Annual checkup');
    expect(foundPet.visits[1].description).toBe('Vaccination');
  });

  test('should update a pet', async () => {
    pet1.name = 'Buddette';
    pet1.birthDate = '2019-12-25';
    await pet1.save();
    const updatedPet = await Pet.findByPk(pet1.id);
    expect(updatedPet.name).toBe('Buddette');
    expect(updatedPet.birthDate).toBe('2019-12-25');
  });

  test('should delete a pet', async () => {
    await Pet.destroy({ where: { id: pet1.id } });
    const foundPet = await Pet.findByPk(pet1.id);
    expect(foundPet).toBeNull();
  });

  test('should have isNew() method inherited from BaseEntity', async () => {
    const newPet = Pet.build({ name: 'New Pet', type_id: petType.id, owner_id: owner.id });
    expect(newPet.isNew()).toBe(true);

    const savedPet = await Pet.create({ name: 'Saved Pet', type_id: petType.id, owner_id: owner.id });
    expect(savedPet.isNew()).toBe(false);
  });

  test('should have toString() method inherited from NamedEntity', async () => {
    const pet = Pet.build({ name: 'Fido' });
    expect(pet.toString()).toBe('Fido');
  });

  test('getBirthDateFormatted() should return date in YYYY-MM-DD format', async () => {
    const pet = Pet.build({ birthDate: '2022-04-20' });
    expect(pet.getBirthDateFormatted()).toBe('2022-04-20');
  });

  test('getBirthDateFormatted() should return empty string if birthDate is null', () => {
    const pet = Pet.build({ birthDate: null });
    expect(pet.getBirthDateFormatted()).toBe('');
  });

  test('addVisit() should add visit to in-memory list', () => {
    const pet = Pet.build({ name: 'TestPet' });
    pet.visits = []; // Initialize visits array for the test
    const visit = Visit.build({ date: '2024-01-01', description: 'Test visit' });
    pet.addVisit(visit);
    expect(pet.visits.length).toBe(1);
    expect(pet.visits[0]).toBe(visit);
  });
});
