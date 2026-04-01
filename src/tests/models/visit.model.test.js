const Visit = require('../../models/visit.model');
const Pet = require('../../models/pet.model');
const PetType = require('../../models/pet-type.model');
const Owner = require('../../models/owner.model');
const { getSequelize, authenticate, sync } = require('../../config/database');
const moment = require('moment');

const sequelize = getSequelize();

describe('Visit Model', () => {
  let owner, petType, pet;

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
      firstName: 'Jane',
      lastName: 'Smith',
      address: '456 Oak Ave',
      city: 'Smallville',
      telephone: '5559876543'
    });
    petType = await PetType.create({ name: 'Cat' });
    pet = await Pet.create({
      name: 'Whiskers',
      birthDate: '2022-01-01',
      type_id: petType.id,
      owner_id: owner.id
    });
  });

  test('should create a visit successfully', async () => {
    const visit = await Visit.create({
      pet_id: pet.id,
      visitDate: '2023-01-15',
      description: 'Checkup for cold'
    });
    expect
