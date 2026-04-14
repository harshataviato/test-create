// test/services/vetService.test.js
const { expect } = require('chai');
const vetService = require('../../src/services/vetService');
const { sequelize, models } = require('../../test/config/testDb');
const { Vet, Specialty } = models;

describe('Vet Service', () => {
  beforeEach(async () => {
    // Truncate all tables and re-seed for a clean state before each test
    await sequelize.query('TRUNCATE TABLE owners, pets, types, visits, vets, specialties, vet_specialties RESTART IDENTITY CASCADE;');

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

  describe('findAllVets', () => {
    it('should retrieve all vets with their specialties, sorted by last name then specialty name', async () => {
      const vets = await vetService.findAllVets();
      expect(vets).to.be.an('array').with.lengthOf(6);
      expect(vets[0].lastName).to.equal('Carter'); // James Carter (no specialties)
      expect(vets[1].lastName).to.equal('Douglas'); // Linda Douglas
      expect(vets[1].specialties.map(s => s.name)).to.deep.equal(['dentistry', 'surgery']); // Specialties sorted by name

      expect(vets[2].lastName).to.equal('Jenkins'); // Sharon Jenkins (no specialties)
      expect(vets[3].lastName).to.equal('Leary'); // Helen Leary
      expect(vets[3].specialties.map(s => s.name)).to.deep.equal(['radiology']); // One specialty

      expect(vets[4].lastName).to.equal('Ortega'); // Rafael Ortega
      expect(vets[4].specialties.map(s => s.name)).to.deep.equal(['surgery']);

      expect(vets[5].lastName).to.equal('Stevens'); // Henry Stevens
      expect(vets[5].specialties.map(s => s.name)).to.deep.equal(['radiology']);
    });

    it('should return empty array if no vets exist', async () => {
      await Vet.destroy({ truncate: true, cascade: true });
      const vets = await vetService.findAllVets();
      expect(vets).to.be.an('array').with.lengthOf(0);
    });
  });

  describe('findPaginatedVets', () => {
    it('should return the first page of vets with specialties', async () => {
      const { vets, totalItems, totalPages } = await vetService.findPaginatedVets(1, 2); // 2 vets per page
      expect(vets).to.be.an('array').with.lengthOf(2);
      expect(totalItems).to.equal(6);
      expect(totalPages).to.equal(3); // 6 vets / 2 per page = 3 pages
      expect(vets[0].lastName).to.equal('Carter');
      expect(vets[1].lastName).to.equal('Douglas');
      expect(vets[1].specialties.map(s => s.name)).to.deep.equal(['dentistry', 'surgery']); // Specialties sorted
    });

    it('should return the second page of vets', async () => {
      const { vets, totalItems, totalPages } = await vetService.findPaginatedVets(2, 2);
      expect(vets).to.be.an('array').with.lengthOf(2);
      expect(totalItems).to.equal(6);
      expect(totalPages).to.equal(3);
      expect(vets[0].lastName).to.equal('Jenkins');
      expect(vets[1].lastName).to.equal('Leary');
    });

    it('should return the last page with remaining vets', async () => {
      const { vets, totalItems, totalPages } = await vetService.findPaginatedVets(3, 2);
      expect(vets).to.be.an('array').with.lengthOf(2);
      expect(totalItems).to.equal(6);
      expect(totalPages).to.equal(3);
      expect(vets[0].lastName).to.equal('Ortega');
      expect(vets[1].lastName).to.equal('Stevens');
    });

    it('should handle page number beyond total pages', async () => {
      const { vets, totalItems, totalPages } = await vetService.findPaginatedVets(10, 2);
      expect(vets).to.be.an('array').with.lengthOf(0);
      expect(totalItems).to.equal(6);
      expect(totalPages).to.equal(3);
    });

    it('should return empty list if no vets in DB', async () => {
      await Vet.destroy({ truncate: true, cascade: true });
      const { vets, totalItems, totalPages } = await vetService.findPaginatedVets(1, 5);
      expect(vets).to.be.an('array').with.lengthOf(0);
      expect(totalItems).to.equal(0);
      expect(totalPages).to.equal(0);
    });
  });
});
