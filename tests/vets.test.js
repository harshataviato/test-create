/**
 * Integration Tests for VetController
 */
const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, closeTestDB, seedVetData } = require('./test-utils');

describe('Vet Controller', () => {
  beforeAll(async () => {
    await setupTestDB();
    await seedVetData();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('GET /vets.html', () => {
    it('should render the vet list page with vets', async () => {
      const res = await request(app).get('/vets.html');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('<h2>Veterinarians</h2>');
      expect(res.text).toContain('James Carter');
      expect(res.text).toContain('Helen Leary');
      expect(res.text).toContain('radiology'); // Specialty
      expect(res.text).toContain('none'); // No specialty
    });
  });

  describe('GET /vets', () => {
    it('should return a JSON list of vets', async () => {
      const res = await request(app).get('/vets');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.body.vetList).toHaveLength(2);
      expect(res.body.vetList[0]).toHaveProperty('firstName', 'James');
      expect(res.body.vetList[1].Specialties).toHaveLength(1);
    });
  });
});
