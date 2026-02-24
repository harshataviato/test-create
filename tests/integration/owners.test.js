const request = require('supertest');
const cheerio = require('cheerio');
const createApp = require('../helpers/appFactory');
const { sequelize, Owner, Pet, PetType } = require('../../models');

const app = createApp();

describe('Integration: Owner Controller', () => {
  
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    // Seed PetTypes
    await PetType.bulkCreate([{ name: 'dog' }, { name: 'cat' }]);
  });

  afterEach(async () => {
    await Owner.destroy({ where: {}, truncate: false }); // Clean owners
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /owners/find', () => {
    it('should render the find owner form', async () => {
      const res = await request(app).get('/owners/find');
      expect(res.statusCode).toBe(200);
      const $ = cheerio.load(res.text);
      expect($('h2').text()).toContain('Find Owners');
      expect($('form').attr('action')).toBe('/owners');
    });
  });

  describe('POST /owners/new', () => {
    it('should create a new owner and redirect', async () => {
      const ownerData = {
        firstName: 'Jane',
        lastName: 'Doe',
        address: '123 Lane',
        city: 'Techville',
        telephone: '1234567890'
      };

      const res = await request(app)
        .post('/owners/new')
        .type('form')
        .send(ownerData);

      expect(res.statusCode).toBe(302); // Redirect
      expect(res.headers.location).toMatch(/\/owners\/\d+/);

      const dbOwner = await Owner.findOne({ where: { lastName: 'Doe' }});
      expect(dbOwner).not.toBeNull();
    });

    it('should return validation errors for invalid input', async () => {
      const invalidData = {
        firstName: '', // Invalid
        lastName: 'Doe',
        address: '123 Lane',
        city: 'Techville',
        telephone: 'abc' // Invalid
      };

      const res = await request(app)
        .post('/owners/new')
        .type('form')
        .send(invalidData);

      expect(res.statusCode).toBe(200); // Re-renders form
      const $ = cheerio.load(res.text);
      expect($('.text-danger').text()).toContain('First name is required');
      expect($('.text-danger').text()).toContain('Telephone must be a 10-digit number');
    });
  });

  describe('GET /owners (Search)', () => {
    beforeEach(async () => {
      await Owner.bulkCreate([
        { firstName: 'John', lastName: 'Smith', address: 'A', city: 'B', telephone: '1111111111' },
        { firstName: 'Alice', lastName: 'Smith', address: 'A', city: 'B', telephone: '2222222222' },
        { firstName: 'Bob', lastName: 'Jones', address: 'A', city: 'B', telephone: '3333333333' }
      ]);
    });

    it('should list multiple owners if search matches many', async () => {
      const res = await request(app).get('/owners').query({ lastName: 'Smith' });
      expect(res.statusCode).toBe(200);
      const $ = cheerio.load(res.text);
      expect($('table tbody tr').length).toBe(2);
    });

    it('should redirect to detail if exactly one owner matches', async () => {
      const res = await request(app).get('/owners').query({ lastName: 'Jones' });
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toMatch(/\/owners\/\d+/);
    });

    it('should show error if no owners found', async () => {
      const res = await request(app).get('/owners').query({ lastName: 'NotInDB' });
      expect(res.statusCode).toBe(200);
      const $ = cheerio.load(res.text);
      expect(res.text).toContain('has not been found');
    });
  });

  describe('GET /owners/:id', () => {
    it('should show owner details', async () => {
      const owner = await Owner.create({
        firstName: 'Detail', lastName: 'User', address: 'X', city: 'Y', telephone: '9999999999'
      });

      const res = await request(app).get(`/owners/${owner.id}`);
      expect(res.statusCode).toBe(200);
      const $ = cheerio.load(res.text);
      expect($('td').text()).toContain('Detail User');
    });

    it('should return 404 for unknown owner', async () => {
      const res = await request(app).get('/owners/99999');
      expect(res.statusCode).toBe(404);
      expect(res.text).toContain('Owner not found');
    });
  });

  describe('POST /owners/:id/edit', () => {
    it('should update owner details', async () => {
      const owner = await Owner.create({
        firstName: 'Old', lastName: 'Name', address: 'X', city: 'Y', telephone: '9999999999'
      });

      const updateData = {
        firstName: 'New',
        lastName: 'Name',
        address: 'X',
        city: 'Y',
        telephone: '9999999999'
      };

      const res = await request(app)
        .post(`/owners/${owner.id}/edit`)
        .type('form')
        .send(updateData);

      expect(res.statusCode).toBe(302);
      const updated = await Owner.findByPk(owner.id);
      expect(updated.firstName).toBe('New');
    });
  });
});
