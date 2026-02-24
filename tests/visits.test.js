/**
 * Integration Tests for VisitController
 */
const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, closeTestDB, seedBasicData } = require('./test-utils');
const { Owner, Pet, PetType, Visit } = require('../src/models');

describe('Visit Controller', () => {
  let owner, pet;

  beforeAll(async () => {
    await setupTestDB();
    await seedBasicData();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    owner = await Owner.create({ 
      firstName: 'Visit', lastName: 'Tester', address: '1 St', city: 'C', telephone: '1234567890' 
    });
    const type = await PetType.findOne({ where: { name: 'dog' } });
    pet = await Pet.create({
      name: 'Rover',
      birthDate: '2018-05-05',
      ownerId: owner.id,
      typeId: type.id
    });
  });

  describe('GET /visits/new', () => {
    it('should render the new visit form', async () => {
      const res = await request(app).get(`/owners/${owner.id}/pets/${pet.id}/visits/new`);
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('New Visit');
      expect(res.text).toContain('Rover');
    });
  });

  describe('POST /visits/new', () => {
    it('should create a new visit', async () => {
      const visitData = {
        date: '2023-10-25',
        description: 'Vaccination'
      };

      const res = await request(app).post(`/owners/${owner.id}/pets/${pet.id}/visits/new`).send(visitData);
      expect(res.statusCode).toBe(302);
      expect(res.header['location']).toBe(`/owners/${owner.id}`);

      const visits = await Visit.findAll({ where: { petId: pet.id } });
      expect(visits).toHaveLength(1);
      expect(visits[0].description).toBe('Vaccination');
    });

    it('should fail validation on invalid data', async () => {
      const res = await request(app).post(`/owners/${owner.id}/pets/${pet.id}/visits/new`).send({
        date: 'not-a-date',
        description: ''
      });
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Invalid date format');
      expect(res.text).toContain('Description is required');
    });
  });
});
