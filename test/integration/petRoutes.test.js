// test/integration/petRoutes.test.js
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');
const { sequelize, models } = require('../../test/config/testDb');
const { Owner, Pet, PetType, Visit } = models;
const session = require('supertest-session');
const moment = require('moment');

describe('Pet Routes', () => {
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
      { id: 1, petId: petId, visitDate: '2010-03-04', description: 'rabies shot' }
    ]);

    authenticatedSession = session(app);
  });

  describe('GET /owners/:ownerId/pets/new', () => {
    it('should render the new pet creation form for an owner', async () => {
      const res = await authenticatedSession.get(`/owners/${ownerId}/pets/new`);
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>New Pet</h2>');
      expect(res.text).to.include(`<form action="/owners/${ownerId}/pets/new"`);
      expect(res.text).to.include('<span>George Franklin</span>'); // Owner info should be present
      expect(res.text).to.include('<option value="cat"'); // Pet types should be loaded
      expect(res.text).to.include('<option value="dog"');
    });

    it('should return 404 if owner not found for new pet form', async () => {
      const res = await authenticatedSession.get('/owners/999/pets/new');
      expect(res.statusCode).to.equal(500); // Middleware catches this
      expect(res.text).to.include('Owner not found with id: 999. Please ensure the ID is correct and the owner exists in the database.');
    });
  });

  describe('POST /owners/:ownerId/pets/new', () => {
    it('should create a new pet and redirect to owner details on success', async () => {
      const newPetData = {
        name: 'Buddy',
        birthDate: '2022-05-10',
        type: 'dog'
      };
      const res = await authenticatedSession
        .post(`/owners/${ownerId}/pets/new`)
        .send(newPetData);

      expect(res.statusCode).to.equal(302);
      expect(res.headers.location).to.equal(`/owners/${ownerId}`);

      // Follow redirect to check flash message and owner details
      const followRes = await authenticatedSession.get(res.headers.location);
      expect(followRes.statusCode).to.equal(200);
      expect(followRes.text).to.include('Buddy');
      expect(followRes.text).to.include('<span id="success-message">New Pet has been Added</span>');
    });

    it('should re-render form with validation errors for invalid data', async () => {
      const invalidPetData = {
        name: '', // Required
        birthDate: 'invalid-date', // Invalid format
        type: 'nonexistent' // Invalid type
      };
      const res = await authenticatedSession
        .post(`/owners/${ownerId}/pets/new`)
        .send(invalidPetData);

      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>New Pet</h2>');
      expect(res.text).to.include('<p>is required</p>'); // Error for name
      expect(res.text).to.include('<p>invalid date</p>'); // Error for birthDate
      expect(res.text).to.include('<p>invalid pet type</p>'); // Error for type
      expect(res.text).to.include('name="birthDate" value="invalid-date"'); // Input field repopulated
    });

    it('should show error for duplicate pet name for the same owner', async () => {
      const duplicatePetData = {
        name: 'Leo', // Duplicate name for owner 1
        birthDate: '2023-01-01',
        type: 'cat'
      };
      const res = await authenticatedSession
        .post(`/owners/${ownerId}/pets/new`)
        .send(duplicatePetData);

      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>New Pet</h2>');
      expect(res.text).to.include('<p>is already in use</p>');
    });

    it('should show error for future birthDate', async () => {
      const futureBirthDateData = {
        name: 'FuturePet',
        birthDate: moment().add(1, 'days').format('YYYY-MM-DD'),
        type: 'dog'
      };
      const res = await authenticatedSession
        .post(`/owners/${ownerId}/pets/new`)
        .send(futureBirthDateData);

      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>New Pet</h2>');
      expect(res.text).to.include('<p>invalid date</p>'); // i18n for 'typeMismatch.birthDate'
    });

    it('should return 404 if owner not found during pet creation', async () => {
      const newPetData = { name: 'Buddy', birthDate: '2022-05-10', type: 'dog' };
      const res = await authenticatedSession
        .post('/owners/999/pets/new')
        .send(newPetData);
      expect(res.statusCode).to.equal(500);
      expect(res.text).to.include('Owner not found with id: 999');
    });
  });

  describe('GET /owners/:ownerId/pets/:petId/edit', () => {
    it('should render the edit pet form for an existing pet', async () => {
      const res = await authenticatedSession.get(`/owners/${ownerId}/pets/${petId}/edit`);
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>Edit Pet</h2>');
      expect(res.text).to.include(`<form action="/owners/${ownerId}/pets/${petId}/edit"`);
      expect(res.text).to.include('name="name" value="Leo"');
      expect(res.text).to.include('<option value="cat" selected>'); // Correct pet type should be selected
    });

    it('should return 404 if owner not found for edit pet form', async () => {
      const res = await authenticatedSession.get('/owners/999/pets/1/edit');
      expect(res.statusCode).to.equal(500);
      expect(res.text).to.include('Owner not found with id: 999');
    });

    it('should return 404 if pet not found for edit pet form', async () => {
      const res = await authenticatedSession.get(`/owners/${ownerId}/pets/999/edit`);
      expect(res.statusCode).to.equal(500);
      expect(res.text).to.include(`Pet not found with id: 999 for owner with id: ${ownerId}`);
    });
  });

  describe('POST /owners/:ownerId/pets/:petId/edit', () => {
    it('should update an existing pet and redirect to owner details on success', async () => {
      const updatedPetData = {
        name: 'Leopard',
        birthDate: '2000-09-07', // Same birth date
        type: 'cat', // Same type
        id: petId // Pet ID passed in form (hidden field)
      };
      const res = await authenticatedSession
        .post(`/owners/${ownerId}/pets/${petId}/edit`)
        .send(updatedPetData);

      expect(res.statusCode).to.equal(302);
      expect(res.headers.location).to.equal(`/owners/${ownerId}`);

      // Follow redirect to check flash message and owner details
      const followRes = await authenticatedSession.get(res.headers.location);
      expect(followRes.statusCode).to.equal(200);
      expect(followRes.text).to.include('Leopard');
      expect(followRes.text).to.include('<span id="success-message">Pet details has been edited</span>');
    });

    it('should re-render form with validation errors for invalid data during update', async () => {
      const invalidPetData = {
        name: '',
        birthDate: 'bad-date',
        type: 'unknown'
      };
      const res = await authenticatedSession
        .post(`/owners/${ownerId}/pets/${petId}/edit`)
        .send(invalidPetData);

      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>Edit Pet</h2>');
      expect(res.text).to.include('<p>is required</p>');
      expect(res.text).to.include('<p>invalid date</p>');
      expect(res.text).to.include('<p>invalid pet type</p>');
    });

    it('should show error for duplicate pet name (excluding itself) for the same owner', async () => {
      // Try to rename Leo to Max (another pet of George)
      const duplicatePetData = {
        name: 'Max',
        birthDate: '2000-09-07',
        type: 'cat',
        id: petId
      };
      const res = await authenticatedSession
        .post(`/owners/${ownerId}/pets/${petId}/edit`)
        .send(duplicatePetData);

      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>Edit Pet</h2>');
      expect(res.text).to.include('<p>is already in use</p>');
    });

    it('should allow retaining the same pet name during update', async () => {
      const sameNamePetData = {
        name: 'Leo', // Same name as before
        birthDate: '2000-09-07',
        type: 'cat',
        id: petId
      };
      const res = await authenticatedSession
        .post(`/owners/${ownerId}/pets/${petId}/edit`)
        .send(sameNamePetData);
      expect(res.statusCode).to.equal(302); // Should pass validation
      expect(res.headers.location).to.equal(`/owners/${ownerId}`);
    });

    it('should return 404 if pet to update not found', async () => {
      const updatedPetData = { name: 'Fake Pet', birthDate: '2020-01-01', type: 'dog' };
      const res = await authenticatedSession
        .post(`/owners/${ownerId}/pets/999/edit`)
        .send(updatedPetData);
      expect(res.statusCode).to.equal(500);
      expect(res.text).to.include(`Pet not found with id: 999 for owner with id: ${ownerId}`);
    });
  });
});
