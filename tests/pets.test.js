/**
 * Integration Tests for PetController
 */
const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, closeTestDB, seedBasicData } = require('./test-utils');
const { Owner, Pet, PetType } = require('../src/models');

describe('Pet Controller', () => {
  let owner;

  beforeAll(async () => {
    await setupTestDB();
    await seedBasicData();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    // Create a fresh owner for each test
    owner = await Owner.create({ 
      firstName: 'Pet', lastName: 'Owner', address: '1 St', city: 'C', telephone: '1234567890' 
    });
  });

  describe('GET /owners/:ownerId/pets/new', () => {
    it('should render create pet form', async () => {
      const res = await request(app).get(`/owners/${owner.id}/pets/new`);
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('New Pet');
      expect(res.text).toContain('<option value="dog" >dog</option>');
    });

    it('should return error if owner not found', async () => {
      // This actually hits the error handler because findOwner middleware calls next(err)
      const res = await request(app).get('/owners/9999/pets/new');
      expect(res.statusCode).toBe(500);
      expect(res.text).toContain('Owner not found');
    });
  });

  describe('POST /owners/:ownerId/pets/new', () => {
    it('should create a pet', async () => {
      const petData = {
        name: 'Buddy',
        birthDate: '2020-01-01',
        type: 'dog'
      };

      const res = await request(app).post(`/owners/${owner.id}/pets/new`).send(petData);
      expect(res.statusCode).toBe(302);
      expect(res.header['location']).toBe(`/owners/${owner.id}`);

      const pets = await Pet.findAll({ where: { ownerId: owner.id } });
      expect(pets).toHaveLength(1);
      expect(pets[0].name).toBe('Buddy');
    });

    it('should fail validation', async () => {
      const res = await request(app).post(`/owners/${owner.id}/pets/new`).send({
        name: '',
        birthDate: 'invalid-date',
        type: ''
      });
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Name is required');
      expect(res.text).toContain('Invalid date format');
    });
  });

  describe('Edit Pet', () => {
    let pet;
    beforeEach(async () => {
      const type = await PetType.findOne({ where: { name: 'cat' } });
      pet = await Pet.create({
        name: 'Kitty',
        birthDate: '2019-01-01',
        ownerId: owner.id,
        typeId: type.id
      });
    });

    it('GET /edit should render form with pet data', async () => {
      const res = await request(app).get(`/owners/${owner.id}/pets/${pet.id}/edit`);
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Update Pet');
      expect(res.text).toContain('value="Kitty"');
      // Check if cat is selected
      expect(res.text).toMatch(/<option value="cat" selected>cat<\/option>/);
    });

    it('POST /edit should update pet', async () => {
      const res = await request(app).post(`/owners/${owner.id}/pets/${pet.id}/edit`).send({
        name: 'Kitty Updated',
        birthDate: '2019-01-01',
        type: 'dog' // Changing type
      });
      expect(res.statusCode).toBe(302);
      
      const updated = await Pet.findByPk(pet.id, { include: 'type' });
      expect(updated.name).toBe('Kitty Updated');
      expect(updated.type.name).toBe('dog');
    });
  });
});
