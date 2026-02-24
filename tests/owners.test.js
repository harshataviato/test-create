/**
 * Integration Tests for OwnerController
 */
const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, closeTestDB, seedBasicData } = require('./test-utils');
const { Owner } = require('../src/models');

describe('Owner Controller', () => {
  beforeAll(async () => {
    await setupTestDB();
    await seedBasicData(); // Seeds PetTypes
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    // Clear owners before each test to ensure predictable state
    await Owner.destroy({ where: {}, truncate: false });
  });

  describe('GET /owners/new', () => {
    it('should render the create owner form', async () => {
      const res = await request(app).get('/owners/new');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('<button class="btn btn-primary" type="submit">Add Owner</button>');
    });
  });

  describe('POST /owners/new', () => {
    it('should create a new owner and redirect to details', async () => {
      const newOwner = {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'New York',
        telephone: '1234567890'
      };

      const res = await request(app).post('/owners/new').send(newOwner);
      expect(res.statusCode).toBe(302);
      expect(res.header['location']).toMatch(/\/owners\/\d+/);

      const created = await Owner.findOne({ where: { lastName: 'Doe' } });
      expect(created).not.toBeNull();
    });

    it('should fail validation when fields are empty', async () => {
      const res = await request(app).post('/owners/new').send({});
      expect(res.statusCode).toBe(200); // Renders form again
      expect(res.text).toContain('First name is required');
      expect(res.text).toContain('is-invalid');
    });

    it('should fail validation with invalid telephone', async () => {
      const invalidOwner = {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 St',
        city: 'City',
        telephone: '123' // Invalid
      };
      const res = await request(app).post('/owners/new').send(invalidOwner);
      expect(res.text).toContain('Telephone must be a 10-digit number');
    });
  });

  describe('GET /owners/find', () => {
    it('should render the find owners form', async () => {
      const res = await request(app).get('/owners/find');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Find Owners');
    });
  });

  describe('GET /owners (Search)', () => {
    beforeEach(async () => {
      await Owner.create({ firstName: 'Alice', lastName: 'Smith', address: 'A', city: 'C', telephone: '1111111111' });
      await Owner.create({ firstName: 'Bob', lastName: 'Smithy', address: 'B', city: 'C', telephone: '2222222222' });
      await Owner.create({ firstName: 'Charlie', lastName: 'Brown', address: 'C', city: 'C', telephone: '3333333333' });
    });

    it('should redirect to owner details if exactly one match found', async () => {
      const res = await request(app).get('/owners').query({ lastName: 'Brown' });
      expect(res.statusCode).toBe(302);
      const owner = await Owner.findOne({ where: { lastName: 'Brown' } });
      expect(res.header['location']).toBe(`/owners/${owner.id}`);
    });

    it('should show list if multiple owners found', async () => {
      // "Smith" matches "Smith" and "Smithy"
      const res = await request(app).get('/owners').query({ lastName: 'Smith' });
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Alice Smith');
      expect(res.text).toContain('Bob Smithy');
      expect(res.text).not.toContain('Charlie Brown');
    });

    it('should show all owners if query is empty', async () => {
      const res = await request(app).get('/owners').query({ lastName: '' });
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Alice Smith');
      expect(res.text).toContain('Bob Smithy');
      expect(res.text).toContain('Charlie Brown');
    });

    it('should show error if no owners found', async () => {
      const res = await request(app).get('/owners').query({ lastName: 'NotFound' });
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('has not been found');
    });
  });

  describe('GET /owners/:id', () => {
    let owner;
    beforeEach(async () => {
      owner = await Owner.create({ firstName: 'Test', lastName: 'User', address: 'A', city: 'C', telephone: '0000000000' });
    });

    it('should show owner details', async () => {
      const res = await request(app).get(`/owners/${owner.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Test User');
      expect(res.text).toContain('Owner Information');
    });

    it('should return 404 if owner does not exist', async () => {
      const res = await request(app).get('/owners/99999');
      expect(res.statusCode).toBe(404);
      expect(res.text).toContain('Owner not found');
    });
  });

  describe('Owner Update', () => {
    let owner;
    beforeEach(async () => {
      owner = await Owner.create({ firstName: 'Update', lastName: 'Me', address: 'A', city: 'C', telephone: '0000000000' });
    });

    it('GET /edit should render update form', async () => {
      const res = await request(app).get(`/owners/${owner.id}/edit`);
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Update Me');
    });

    it('POST /edit should update owner', async () => {
      const res = await request(app).post(`/owners/${owner.id}/edit`).send({
        firstName: 'Updated',
        lastName: 'Me',
        address: 'New Addr',
        city: 'New City',
        telephone: '0000000000'
      });
      expect(res.statusCode).toBe(302);
      expect(res.header['location']).toBe(`/owners/${owner.id}`);

      const updated = await Owner.findByPk(owner.id);
      expect(updated.firstName).toBe('Updated');
    });

    it('POST /edit should fail validation', async () => {
      const res = await request(app).post(`/owners/${owner.id}/edit`).send({
        firstName: '', // Invalid
        lastName: 'Me',
        address: 'A',
        city: 'C',
        telephone: '0000000000'
      });
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('First name is required');
    });
  });
});
