// test/integration/vetRoutes.test.js
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');
const { sequelize, models } = require('../../test/config/testDb');
const { Vet, Specialty } = models;

describe('Vet Routes', () => {
  beforeEach(async () => {
    // Re-seed the database with initial data before each test
    await sequelize.query('TRUNCATE TABLE vets, specialties, vet_specialties RESTART IDENTITY CASCADE;');

    // Seed data for vets and specialties
    await Vet.bulkCreate([
      { id: 1, firstName: 'James', lastName: 'Carter' },
      { id: 2, firstName: 'Helen', lastName: 'Leary' },
      { id: 3, firstName: 'Linda', lastName: 'Douglas' },
      { id: 4, firstName: 'Rafael', lastName: 'Ortega' },
      { id: 5, firstName: 'Henry', lastName: 'Stevens' },
      { id: 6, firstName: 'Sharon', lastName: 'Jenkins' },
    ]);
    await Specialty.bulkCreate([
      { id: 1, name: 'radiology' },
      { id: 2, name: 'surgery' },
      { id: 3, name: 'dentistry' },
    ]);
    await sequelize.query(`
      INSERT INTO vet_specialties (vet_id, specialty_id) VALUES
      (2, 1), -- Helen Leary has radiology
      (3, 2), -- Linda Douglas has surgery
      (3, 3), -- Linda Douglas has dentistry
      (4, 2), -- Rafael Ortega has surgery
      (5, 1); -- Henry Stevens has radiology
    `);
  });

  describe('GET /vets.html', () => {
    it('should render the vets list page with pagination', async () => {
      const res = await request(app).get('/vets/vets.html');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>Veterinarians</h2>');
      expect(res.text).to.include('<td>James Carter</td>');
      expect(res.text).to.include('<td>Helen Leary</td>');
      expect(res.text).to.include('<td>radiology</td>'); // Helen's specialty
      expect(res.text).to.include('<span>pages:</span>'); // Check for pagination controls
    });

    it('should display the correct number of vets per page (default 5)', async () => {
      const res = await request(app).get('/vets/vets.html');
      expect(res.statusCode).to.equal(200);
      const vetNamesOnPage = (res.text.match(/<td>James Carter<\/td>|<td>Helen Leary<\/td>|<td>Linda Douglas<\/td>|<td>Rafael Ortega<\/td>|<td>Henry Stevens<\/td>|<td>Sharon Jenkins<\/td>/g) || []).length;
      expect(vetNamesOnPage).to.equal(5); // Default page size is 5, with 6 vets total.
    });

    it('should navigate to the second page of vets', async () => {
      const res = await request(app).get('/vets/vets.html?page=2');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.not.include('James Carter'); // Should not be on second page
      expect(res.text).to.include('Sharon Jenkins'); // Should be on second page
      expect(res.text).to.include('<span>2</span>'); // Current page is 2
    });

    it('should handle page parameter out of bounds gracefully (empty list)', async () => {
      const res = await request(app).get('/vets/vets.html?page=100');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.not.include('James Carter'); // No vets should be displayed
      expect(res.text).to.include('<h2>Veterinarians</h2>'); // Still renders the page layout
    });

    it('should show "none" for vets without specialties', async () => {
      const res = await request(app).get('/vets/vets.html');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<td>James Carter</td>\n          <td>\n            none\n          </td>');
      expect(res.text).to.include('<td>Sharon Jenkins</td>\n          <td>\n            none\n          </td>');
    });
  });

  describe('GET /vets (JSON API)', () => {
    it('should return a JSON array of all vets with specialties', async () => {
      const res = await request(app).get('/vets');
      expect(res.statusCode).to.equal(200);
      expect(res.headers['content-type']).to.include('application/json');
      expect(res.body).to.have.property('vetList').that.is.an('array').with.lengthOf(6);

      const helen = res.body.vetList.find(v => v.firstName === 'Helen');
      expect(helen).to.exist;
      expect(helen.specialties).to.be.an('array').with.lengthOf(1);
      expect(helen.specialties[0].name).to.equal('radiology');

      const linda = res.body.vetList.find(v => v.firstName === 'Linda');
      expect(linda).to.exist;
      expect(linda.specialties).to.be.an('array').with.lengthOf(2);
      expect(linda.specialties.map(s => s.name)).to.include.members(['dentistry', 'surgery']);

      const james = res.body.vetList.find(v => v.firstName === 'James');
      expect(james).to.exist;
      expect(james.specialties).to.be.an('array').with.lengthOf(0);
    });

    it('should return an empty array if no vets exist', async () => {
      await Vet.destroy({ truncate: true, cascade: true });
      const res = await request(app).get('/vets');
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('vetList').that.is.an('array').with.lengthOf(0);
    });
  });
});
