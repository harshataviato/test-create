const request = require('supertest');
const cheerio = require('cheerio');
const createApp = require('../helpers/appFactory');
const { sequelize, Owner, Pet, PetType, Visit } = require('../../models');

const app = createApp();

describe('Integration: Pet & Visit Controllers', () => {
  let owner;
  let typeDog;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    typeDog = await PetType.create({ name: 'dog' });
    await PetType.create({ name: 'cat' });
  });

  beforeEach(async () => {
    owner = await Owner.create({
      firstName: 'Pet', lastName: 'Owner', address: '1', city: 'C', telephone: '1234567890'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Pet Management', () => {
    it('should render the add pet form', async () => {
      const res = await request(app).get(`/owners/${owner.id}/pets/new`);
      expect(res.statusCode).toBe(200);
      const $ = cheerio.load(res.text);
      expect($('option').length).toBeGreaterThan(0); // Checks PetTypes loaded
    });

    it('should create a new pet', async () => {
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/new`)
        .type('form')
        .send({
          name: 'Rex',
          birthDate: '2022-01-01',
          type_id: typeDog.id
        });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe(`/owners/${owner.id}`);

      const pet = await Pet.findOne({ where: { name: 'Rex', owner_id: owner.id }});
      expect(pet).toBeDefined();
    });

    it('should prevent duplicate pet names for same owner', async () => {
      // Create first
      await Pet.create({ name: 'Fido', birthDate: '2022-01-01', type_id: typeDog.id, owner_id: owner.id });

      // Try create second same name
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/new`)
        .type('form')
        .send({
          name: 'Fido', // Duplicate
          birthDate: '2023-01-01',
          type_id: typeDog.id
        });

      expect(res.statusCode).toBe(200); // Re-renders form
      const $ = cheerio.load(res.text);
      expect($('.text-danger').text()).toContain('is already in use');
    });

    it('should update existing pet', async () => {
      const pet = await Pet.create({ name: 'OldName', birthDate: '2022-01-01', type_id: typeDog.id, owner_id: owner.id });

      const res = await request(app)
        .post(`/owners/${owner.id}/pets/${pet.id}/edit`)
        .type('form')
        .send({
          name: 'NewName',
          birthDate: '2022-01-01',
          type_id: typeDog.id
        });

      expect(res.statusCode).toBe(302);
      const updated = await Pet.findByPk(pet.id);
      expect(updated.name).toBe('NewName');
    });
  });

  describe('Visit Management', () => {
    let pet;
    beforeEach(async () => {
      pet = await Pet.create({ name: 'Visitor', birthDate: '2022-01-01', type_id: typeDog.id, owner_id: owner.id });
    });

    it('should render new visit form', async () => {
      const res = await request(app).get(`/owners/${owner.id}/pets/${pet.id}/visits/new`);
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Previous Visits');
    });

    it('should create a new visit', async () => {
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/${pet.id}/visits/new`)
        .type('form')
        .send({
          date: '2023-10-10',
          description: 'Regular Checkup'
        });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe(`/owners/${owner.id}`);

      const visits = await Visit.findAll({ where: { pet_id: pet.id } });
      expect(visits.length).toBe(1);
      expect(visits[0].description).toBe('Regular Checkup');
    });

    it('should validate visit input', async () => {
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/${pet.id}/visits/new`)
        .type('form')
        .send({
          date: 'invalid-date',
          description: ''
        });

      expect(res.statusCode).toBe(200);
      const $ = cheerio.load(res.text);
      expect($('.text-danger').text()).toContain('Description is required');
    });
  });
});
