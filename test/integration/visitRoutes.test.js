// test/integration/visitRoutes.test.js
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');
const { sequelize, models } = require('../../test/config/testDb');
const { Owner, Pet, PetType, Visit } = models;
const session = require('supertest-session');
const moment = require('moment');

describe('Visit Routes', () => {
  let authenticatedSession;
  let ownerId;
  let petId;

  beforeEach(async () => {
    // Re-seed the database with initial data before each test
    await sequelize.query('TRUNCATE TABLE owners, pets, types, visits, vets, specialties, vet_specialties RESTART IDENTITY CASCADE;');

    await Owner.bulkCreate([
      { id: 1, firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' }
    ]);
    ownerId = 1;

    await PetType.bulkCreate([
      { id: 1, name: 'cat' },
      { id: 2, name: 'dog' }
    ]);

    await Pet.bulkCreate([
      { id: 1, name: 'Leo', birthDate: '2000-09-07', typeId: 1, ownerId: ownerId },
      { id: 2, name: 'Max', birthDate: '2001-01-15', typeId: 2, ownerId: ownerId }
    ]);
    petId = 1; // Leo's ID

    await Visit.bulkCreate([
      { id: 1, petId: petId, visitDate: '2010-03-04', description: 'rabies shot' },
      { id: 2, petId: petId, visitDate: '2011-04-05', description: 'checkup' }
    ]);

    authenticatedSession = session(app);
  });

  describe('GET /owners/:ownerId/pets/:petId/visits/new', () => {
    it('should render the new visit form for a pet', async () => {
      const res = await authenticatedSession.get(`/owners/${ownerId}/pets/${petId}/visits/new`);
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>New Visit</h2>');
      expect(res.text).to.include(`<form action="/owners/${ownerId}/pets/${petId}/visits/new"`);
      expect(res.text).to.include('<td>Leo</td>'); // Pet info
      expect(res.text).to.include('<td>George Franklin</td>'); // Owner info
      expect(res.text).to.include('rabies shot'); // Previous visits
      expect(res.text).to.include('checkup');
    });

    it('should show "none" if no previous visits for a pet', async () => {
      const petWithoutVisitsId = 2; // Max has no visits initially
      const res = await authenticatedSession.get(`/owners/${ownerId}/pets/${petWithoutVisitsId}/visits/new`);
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<td>Max</td>');
      expect(res.text).to.include('<td>none</td>'); // "none" for visits
    });

    it('should return 404 if owner not found for new visit form', async () => {
      const res = await authenticatedSession.get('/owners/999/pets/1/visits/new');
      expect(res.statusCode).to.equal(500); // Middleware catches this
      expect(res.text).to.include('Owner not found with id: 999');
    });

    it('should return 404 if pet not found for new visit form', async () => {
      const res = await authenticatedSession.get(`/owners/${ownerId}/pets/999/visits/new`);
      expect(res.statusCode).to.equal(500); // Middleware catches this
      expect(res.text).to.include(`Pet not found with id: 999 for owner with id: ${ownerId}`);
    });
  });

  describe('POST /owners/:ownerId/pets/:petId/visits/new', () => {
    it('should create a new visit and redirect to owner details on success', async () => {
      const visitDate = moment().format('YYYY-MM-DD'); // Today's date
      const newVisitData = {
        date: visitDate,
        description: 'New checkup'
      };
      const res = await authenticatedSession
        .post(`/owners/${ownerId}/pets/${petId}/visits/new`)
        .send(newVisitData);

      expect(res.statusCode).to.equal(302);
      expect(res.headers.location).to.equal(`/owners/${ownerId}`);

      // Follow redirect to check flash message and owner details
      const followRes = await authenticatedSession.get(res.headers.location);
      expect(followRes.statusCode).to.equal(200);
      expect(followRes.text).to.include('New checkup');
      expect(followRes.text).to.include('<span id="success-message">Your visit has been booked</span>');

      // Verify visit exists in DB
      const visits = await Visit.findAll({ where: { petId: petId } });
      expect(visits).to.have.lengthOf(3); // 2 existing + 1 new
      expect(visits.find(v => v.description === 'New checkup')).to.exist;
    });

    it('should re-render form with validation errors for invalid data', async () => {
      const invalidVisitData = {
        date: 'invalid-date', // Invalid format
        description: '' // Required
      };
      const res = await authenticatedSession
        .post(`/owners/${ownerId}/pets/${petId}/visits/new`)
        .send(invalidVisitData);

      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>New Visit</h2>');
      expect(res.text).to.include('<p>invalid date</p>');
      expect(res.text).to.include('<p>is required</p>');
      expect(res.text).to.include('name="date" value="invalid-date"'); // Input field repopulated
    });

    it('should return 404 if owner not found during visit creation', async () => {
      const newVisitData = { date: '2023-01-01', description: 'Test' };
      const res = await authenticatedSession
        .post('/owners/999/pets/1/visits/new')
        .send(newVisitData);
      expect(res.statusCode).to.equal(500);
      expect(res.text).to.include('Owner not found with id: 999');
    });

    it('should return 404 if pet not found for owner during visit creation', async () => {
      const newVisitData = { date: '2023-01-01', description: 'Test' };
      const res = await authenticatedSession
        .post(`/owners/${ownerId}/pets/999/visits/new`)
        .send(newVisitData);
      expect(res.statusCode).to.equal(500);
      expect(res.text).to.include(`Pet not found with id: 999 for owner with id: ${ownerId}`);
    });
  });
});
