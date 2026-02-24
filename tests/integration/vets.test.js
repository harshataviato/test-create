const request = require('supertest');
const cheerio = require('cheerio');
const createApp = require('../helpers/appFactory');
const { sequelize, Vet, Specialty } = require('../../models');

const app = createApp();

describe('Integration: Vet Controller', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Seed Vets
    const s1 = await Specialty.create({ name: 'radiology' });
    const v1 = await Vet.create({ firstName: 'James', lastName: 'Bond' });
    await v1.addSpecialty(s1);

    await Vet.create({ firstName: 'No', lastName: 'Spec' });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /vets.html', () => {
    it('should display list of vets in HTML', async () => {
      const res = await request(app).get('/vets.html');
      expect(res.statusCode).toBe(200);
      expect(res.type).toBe('text/html');
      
      const $ = cheerio.load(res.text);
      expect($('table#vets').length).toBe(1);
      expect($('td').text()).toContain('James Bond');
      expect($('td').text()).toContain('radiology');
    });
  });

  describe('GET /vets', () => {
    it('should return list of vets in JSON', async () => {
      const res = await request(app).get('/vets');
      expect(res.statusCode).toBe(200);
      expect(res.type).toBe('application/json');
      
      expect(res.body.vetList).toBeDefined();
      expect(res.body.vetList.length).toBeGreaterThanOrEqual(2);
      
      const bond = res.body.vetList.find(v => v.lastName === 'Bond');
      expect(bond).toBeDefined();
      expect(bond.Specialties[0].name).toBe('radiology');
    });
  });
});
