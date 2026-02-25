/**
 * @file test/controllers/ownerController.test.js
 * @description Automated tests for ownerController, including owner, pet, and visit routes.
 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const app = require('../../app'); // Your Express app
const { Owner, Pet, PetType, Visit, sequelize } = require('../../models');
const { resetAndSeedDatabase } = require('../helpers');
const moment = require('moment');

// Mock `req.flash` as it's not available in supertest without session middleware
const mockFlashMiddleware = (req, res, next) => {
  req.flash = (type, message) => {
    req.session = req.session || {};
    req.session.flash = req.session.flash || {};
    if (message) {
      req.session.flash[type] = message;
    } else {
      const msg = req.session.flash[type];
      delete req.session.flash[type];
      return msg;
    }
  };
  next();
};

describe('OwnerController', () => {
  let sandbox;
  let server;

  before(async () => {
    // Start the server for supertest
    server = app.listen(0); // Listen on a random available port
    await resetAndSeedDatabase();
    // Re-seed DB for each file ensures clean state
    // We don't need app.listen() here, supertest will handle it with `app` directly
    // but the `startServer` function in app.js actually starts listening.
    // For supertest, it's better to export the app directly and use it without calling listen.
    // However, the current setup calls listen in app.js, so we need to ensure tests don't try to listen again.
    // If app.js listens, we need to ensure app.js is not trying to sync DB for test env.
    // The `app.js` needs to be modified to NOT call `startServer()` if `NODE_ENV === 'test'`.
    // For now, I'll rely on `resetAndSeedDatabase` to manage the test DB.
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    // Apply flash mock before each test for consistency
    app.use(mockFlashMiddleware);
  });

  afterEach(() => {
    sandbox.restore();
    // Remove the mock middleware after each test to prevent interference
    app._router.stack = app._router.stack.filter(
      layer => layer.handle !== mockFlashMiddleware
    );
  });

  after(async () => {
    await server.close();
    await sequelize.close(); // Close the database connection after all tests
  });

  describe('Owner Creation', () => {
    it('GET /owners/new should render owner creation form', async () => {
      const res = await request(app).get('/owners/new');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('New Owner');
      expect(res.text).to.include('<form id="owner" action="/owners/new" method="post">');
    });

    it('POST /owners/new should create a new owner and redirect to details', async () => {
      const res = await request(app)
        .post('/owners/new')
        .send({
          firstName: 'Alice',
          lastName: 'Smith',
          address: '789 Pine St',
          city: 'Oakville',
          telephone: '0987654321'
        })
        .set('Accept', 'application/x-www-form-urlencoded');

      expect(res.statusCode).to.equal(302);
      expect(res.header.location).to.match(/\/owners\/\d+/);

      const newOwnerId = res.header.location.split('/').pop();
      const newOwner = await Owner.findByPk(newOwnerId);
      expect(newOwner).to.exist;
      expect(newOwner.firstName).to.equal('Alice');
    });

    it('POST /owners/new should return validation errors for invalid data', async () => {
      const res = await request(app)
        .post('/owners/new')
        .send({
          firstName: '', // Empty
          lastName: 'Smith',
          address: '789 Pine St',
          city: 'Oakville',
          telephone: 'invalid' // Invalid
        })
        .set('Accept', 'application/x-www-form-urlencoded');

      expect(res.statusCode).to.equal(200); // Renders the form with errors
      expect(res.text).to.include('New Owner');
      expect(res.text).to.include('firstName required');
      expect(res.text).to.include('telephone invalid');
    });
  });

  describe('Owner Find & List', () => {
    it('GET /owners/find should render find owner form', async () => {
      const res = await request(app).get('/owners/find');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Find Owners');
      expect(res.text).to.include('<form id="search-owner-form" action="/owners" method="get">');
    });

    it('GET /owners should return all owners if lastName is empty', async () => {
      const res = await request(app).get('/owners?lastName=');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Owners');
      expect(res.text).to.include('George Franklin'); // Seeded data
      expect(res.text).to.include('Betty Davis'); // Seeded data
    });

    it('GET /owners should redirect to details if exactly one owner found', async () => {
      const res = await request(app).get('/owners?lastName=Franklin');
      expect(res.statusCode).to.equal(302);
      const owner = await Owner.findOne({ where: { lastName: 'Franklin' } });
      expect(res.header.location).to.equal(`/owners/${owner.id}`);
    });

    it('GET /owners should list multiple owners if more than one found', async () => {
      // There are two 'Davis' owners in seed data: Betty Davis (id=2), Harold Davis (id=4)
      const res = await request(app).get('/owners?lastName=Davis');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Owners');
      expect(res.text).to.include('Betty Davis');
      expect(res.text).to.include('Harold Davis');
    });

    it('GET /owners should show "not found" message if no owners match', async () => {
      const res = await request(app).get('/owners?lastName=NonExistent');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Find Owners');
      expect(res.text).to.include('lastName not found');
    });

    it('GET /owners should paginate results', async () => {
      // Assuming PAGE_SIZE = 5, we have 10 initial owners.
      // After deleting Jean Coleman, we have 9.
      // So page 1 should have 5, page 2 should have 4.
      const resPage1 = await request(app).get('/owners?lastName=&page=1');
      expect(resPage1.statusCode).to.equal(200);
      expect(resPage1.text).to.include('George Franklin');
      expect(resPage1.text).to.not.include('David Schroeder'); // Should be on page 2

      const resPage2 = await request(app).get('/owners?lastName=&page=2');
      expect(resPage2.statusCode).to.equal(200);
      expect(resPage2.text).to.include('David Schroeder');
      expect(resPage2.text).to.not.include('George Franklin'); // Should be on page 1
    });
  });

  describe('Owner Details', () => {
    it('GET /owners/{ownerId} should display owner details with pets and visits', async () => {
      const ownerId = 1; // George Franklin
      const res = await request(app).get(`/owners/${ownerId}`);
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Owner Information');
      expect(res.text).to.include('George Franklin');
      expect(res.text).to.include('Leo'); // Pet
      expect(res.text).to.include('Checkup'); // Visit
    });

    it('GET /owners/{ownerId} should return 404 for non-existent owner', async () => {
      const res = await request(app).get('/owners/99999');
      expect(res.statusCode).to.equal(404);
      expect(res.text).to.include('Resource Not Found');
      expect(res.text).to.include('Owner not found with id: 99999');
    });
  });

  describe('Owner Update', () => {
    let testOwner;
    beforeEach(async () => {
      testOwner = await Owner.create({
        firstName: 'Update',
        lastName: 'Me',
        address: '100 Old Lane',
        city: 'Oldtown',
        telephone: '1111111111'
      });
    });
    afterEach(async () => {
      await Owner.destroy({ where: { id: testOwner.id } });
    });

    it('GET /owners/{ownerId}/edit should render update owner form', async () => {
      const res = await request(app).get(`/owners/${testOwner.id}/edit`);
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Owner');
      expect(res.text).to.include(testOwner.firstName);
      expect(res.text).to.include(testOwner.lastName);
      expect(res.text).to.include(`<form id="owner" action="/owners/${testOwner.id}/edit" method="post">`);
    });

    it('GET /owners/{ownerId}/edit should return 404 for non-existent owner', async () => {
      const res = await request(app).get('/owners/99999/edit');
      expect(res.statusCode).to.equal(404);
      expect(res.text).to.include('Resource Not Found');
      expect(res.text).to.include('Owner not found with id: 99999');
    });

    it('POST /owners/{ownerId}/edit should update owner and redirect to details', async () => {
      const res = await request(app)
        .post(`/owners/${testOwner.id}/edit`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          address: '200 New Rd',
          city: 'Newcity',
          telephone: '2222222222'
        })
        .set('Accept', 'application/x-www-form-urlencoded');

      expect(res.statusCode).to.equal(302);
      expect(res.header.location).to.equal(`/owners/${testOwner.id}`);

      const updatedOwner = await Owner.findByPk(testOwner.id);
      expect(updatedOwner.firstName).to.equal('Updated');
      expect(updatedOwner.lastName).to.equal('Name');
      expect(updatedOwner.telephone).to.equal('2222222222');
    });

    it('POST /owners/{ownerId}/edit should return validation errors for invalid data', async () => {
      const res = await request(app)
        .post(`/owners/${testOwner.id}/edit`)
        .send({
          firstName: '',
          lastName: 'Name',
          address: '200 New Rd',
          city: 'Newcity',
          telephone: 'short'
        })
        .set('Accept', 'application/x-www-form-urlencoded');

      expect(res.statusCode).to.equal(200); // Renders the form with errors
      expect(res.text).to.include('Owner');
      expect(res.text).to.include('firstName required');
      expect(res.text).to.include('telephone invalid');
    });

    it('POST /owners/{ownerId}/edit should return 404 if owner does not exist', async () => {
      const res = await request(app)
        .post('/owners/99999/edit')
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          address: '200 New Rd',
          city: 'Newcity',
          telephone: '2222222222'
        })
        .set('Accept', 'application/x-www-form-urlencoded');

      expect(res.statusCode).to.equal(404);
      expect(res.text).to.include('Resource Not Found');
      expect(res.text).to.include('Owner not found with id: 99999');
    });
  });

  describe('Pet Management', () => {
    let owner;
    let dogType;
    let catType;
    beforeEach(async () => {
      // Ensure clean state for owner and pet types
      await resetAndSeedDatabase(); // Reset all initial data
      owner = await Owner.create({
        firstName: 'Pet',
        lastName: 'Owner',
        address: '123 Pet St',
        city: 'Petville',
        telephone: '5551112222'
      });
      dogType = await PetType.findOne({ where: { name: 'dog' } });
      catType = await PetType.findOne({ where: { name: 'cat' } });
    });

    // Pet Creation
    it('GET /owners/{ownerId}/pets/new should render new pet form', async () => {
      const res = await request(app).get(`/owners/${owner.id}/pets/new`);
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include(`New Pet`);
      expect(res.text).to.include(owner.firstName);
      expect(res.text).to.include(`<form id="pet" action="/owners/${owner.id}/pets/new" method="post">`);
    });

    it('POST /owners/{ownerId}/pets/new should create a new pet and redirect', async () => {
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/new`)
        .send({
          name: 'Buddy',
          birthDate: '2020-01-01',
          type: dogType.name // Send type name
        })
        .set('Accept', 'application/x-www-form-urlencoded');

      expect(res.statusCode).to.equal(302);
      expect(res.header.location).to.equal(`/owners/${owner.id}`);

      const newPet = await Pet.findOne({ where: { name: 'Buddy', ownerId: owner.id } });
      expect(newPet).to.exist;
      expect(newPet.typeId).to.equal(dogType.id);
    });

    it('POST /owners/{ownerId}/pets/new should return validation errors for invalid data', async () => {
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/new`)
        .send({
          name: '', // Empty
          birthDate: 'not-a-date', // Invalid date
          type: 'non-existent' // Non-existent type
        })
        .set('Accept', 'application/x-www-form-urlencoded');

      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('New Pet');
      expect(res.text).to.include('name required');
      expect(res.text).to.include('typeMismatch.date');
      expect(res.text).to.include('type not found');
    });

    it('POST /owners/{ownerId}/pets/new should return error for duplicate pet name for owner', async () => {
      await Pet.create({ name: 'Rex', birthDate: '2019-01-01', typeId: dogType.id, ownerId: owner.id });

      const res = await request(app)
        .post(`/owners/${owner.id}/pets/new`)
        .send({
          name: 'Rex', // Duplicate name
          birthDate: '2021-01-01',
          type: dogType.name
        })
        .set('Accept', 'application/x-www-form-urlencoded');

      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('New Pet');
      expect(res.text).to.include('name duplicate');
    });

    it('POST /owners/{ownerId}/pets/new should return error for future birth date', async () => {
      const futureDate = moment().add(1, 'day').format('YYYY-MM-DD');
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/new`)
        .send({
          name: 'FuturePet',
          birthDate: futureDate,
          type: dogType.name
        })
        .set('Accept', 'application/x-www-form-urlencoded');

      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('New Pet');
      expect(res.text).to.include('typeMismatch.birthDate');
    });

    // Pet Update
    it('GET /owners/{ownerId}/pets/{petId}/edit should render update pet form', async () => {
      const pet = await Pet.create({ name: 'Fluffy', birthDate: '2021-03-01', typeId: catType.id, ownerId: owner.id });
      const res = await request(app).get(`/owners/${owner.id}/pets/${pet.id}/edit`);
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include(`Edit Pet`);
      expect(res.text).to.include(pet.name);
      expect(res.text).to.include(`<form id="pet" action="/owners/${owner.id}/pets/${pet.id}/edit" method="post">`);
    });

    it('GET /owners/{ownerId}/pets/{petId}/edit should return 404 if owner not found', async () => {
      const pet = await Pet.create({ name: 'Fluffy', birthDate: '2021-03-01', typeId: catType.id, ownerId: owner.id });
      const res = await request(app).get(`/owners/99999/pets/${pet.id}/edit`);
      expect(res.statusCode).to.equal(404);
      expect(res.text).to.include('Resource Not Found');
      expect(res.text).to.include('Owner not found with id: 99999');
    });

    it('GET /owners/{ownerId}/pets/{petId}/edit should return 404 if pet not found for owner', async () => {
      const res = await request(app).get(`/owners/${owner.id}/pets/99999/edit`);
      expect(res.statusCode).to.equal(404);
      expect(res.text).to.include('Resource Not Found');
      expect(res.text).to.include(`Pet with id 99999 not found for owner with id ${owner.id}`);
    });

    it('POST /owners/{ownerId}/pets/{petId}/edit should update pet and redirect', async () => {
      const pet = await Pet.create({ name: 'OldName', birthDate: '2021-03-01', typeId: catType.id, ownerId: owner.id });
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/${pet.id}/edit`)
        .send({
          name: 'NewName',
          birthDate: '2021-03-02',
          type: dogType.name
        })
        .set('Accept', 'application/x-www-form-urlencoded');

      expect(res.statusCode).to.equal(302);
      expect(res.header.location).to.equal(`/owners/${owner.id}`);

      const updatedPet = await Pet.findByPk(pet.id);
      expect(updatedPet.name).to.equal('NewName');
      expect(updatedPet.typeId).to.equal(dogType.id);
    });

    it('POST /owners/{ownerId}/pets/{petId}/edit should return validation errors', async () => {
      const pet = await Pet.create({ name: 'TestPet', birthDate: '2021-03-01', typeId: catType.id, ownerId: owner.id });
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/${pet.id}/edit`)
        .send({
          name: '',
          birthDate: 'future-date', // Invalid
          type: 'non-existent'
        })
        .set('Accept', 'application/x-www-form-urlencoded');

      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Edit Pet');
      expect(res.text).to.include('name required');
      expect(res.text).to.include('typeMismatch.date');
      expect(res.text).to.include('type not found');
    });

    it('POST /owners/{ownerId}/pets/{petId}/edit should return error for duplicate pet name (different pet)', async () => {
      const pet1 = await Pet.create({ name: 'PetOne', birthDate: '2019-01-01', typeId: dogType.id, ownerId: owner.id });
      const pet2 = await Pet.create({ name: 'PetTwo', birthDate: '2020-01-01', typeId: dogType.id, ownerId: owner.id });

      const res = await request(app)
        .post(`/owners/${owner.id}/pets/${pet2.id}/edit`)
        .send({
          name: 'PetOne', // Duplicate of pet1
          birthDate: '2020-01-01',
          type: dogType.name
        })
        .set('Accept', 'application/x-www-form-urlencoded');

      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Edit Pet');
      expect(res.text).to.include('name duplicate');
    });

    it('POST /owners/{ownerId}/pets/{petId}/edit should allow same pet name if updating same pet', async () => {
      const pet = await Pet.create({ name: 'SameName', birthDate: '2019-01-01', typeId: dogType.id, ownerId: owner.id });

      const res = await request(app)
        .post(`/owners/${owner.id}/pets/${pet.id}/edit`)
        .send({
          name: 'SameName', // Same name for the same pet
          birthDate: '2019-01-01',
          type: dogType.name
        })
        .set('Accept', 'application/x-www-form-urlencoded');

      expect(res.statusCode).to.equal(302);
      expect(res.header.location).to.equal(`/owners/${owner.id}`);
    });
  });

  describe('Visit Management', () => {
    let owner;
    let pet;
    let dogType;
    beforeEach(async () => {
      await resetAndSeedDatabase();
      owner = await Owner.create({
        firstName: 'Visit',
        lastName: 'Owner',
        address: '123 Visit St',
        city: 'Visitville',
        telephone: '3334445555'
      });
      dogType = await PetType.findOne({ where: { name: 'dog' } });
      pet = await Pet.create({
        name: 'Fido',
        birthDate: '2018-05-10',
        typeId: dogType.id,
        ownerId: owner.id
      });
    });

    it('GET /owners/{ownerId}/pets/{petId}/visits/new should render new visit form', async () => {
      const res = await request(app).get(`/owners/${owner.id}/pets/${pet.id}/visits/new`);
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include(`New Visit`);
      expect(res.text).to.include(owner.firstName);
      expect(res.text).to.include(pet.name);
      expect(res.text).to.include(`<form id="visit" action="/owners/${owner.id}/pets/${pet.id}/visits/new" method="post">`);
      expect(res.text).to.include(`value="${moment().format('YYYY-MM-DD')}"`); // Pre-filled date
    });

    it('GET /owners/{ownerId}/pets/{petId}/visits/new should return 404 if owner not found', async () => {
      const res = await request(app).get(`/owners/99999/pets/${pet.id}/visits/new`);
      expect(res.statusCode).to.equal(404);
      expect(res.text).to.include('Resource Not Found');
      expect(res.text).to.include('Owner not found with id: 99999');
    });

    it('GET /owners/{ownerId}/pets/{petId}/visits/new should return 404 if pet not found for owner', async () => {
      const res = await request(app).get(`/owners/${owner.id}/pets/99999/visits/new`);
      expect(res.statusCode).to.equal(404);
      expect(res.text).to.include('Resource Not Found');
      expect(res.text).to.include(`Pet with id 99999 not found for owner with id ${owner.id}`);
    });

    it('POST /owners/{ownerId}/pets/{petId}/visits/new should create a new visit and redirect', async () => {
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/${pet.id}/visits/new`)
        .send({
          date: '2023-06-15',
          description: 'Routine checkup'
        })
        .set('Accept', 'application/x-www-form-urlencoded');

      expect(res.statusCode).to.equal(302);
      expect(res.header.location).to.equal(`/owners/${owner.id}`);

      const newVisit = await Visit.findOne({ where: { petId: pet.id, description: 'Routine checkup' } });
      expect(newVisit).to.exist;
      expect(newVisit.visitDate).to.equal('2023-06-15');
    });

    it('POST /owners/{ownerId}/pets/{petId}/visits/new should return validation errors', async () => {
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/${pet.id}/visits/new`)
        .send({
          date: 'invalid-date', // Invalid
          description: '' // Empty
        })
        .set('Accept', 'application/x-www-form-urlencoded');

      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('New Visit');
      expect(res.text).to.include('typeMismatch.date');
      expect(res.text).to.include('description required');
    });
  });

  describe('i18n Middleware Integration', () => {
    it('should display messages in default language (English)', async () => {
      const res = await request(app).get('/owners/new');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('New Owner'); // English
      expect(res.text).to.include('Add Owner'); // English
    });

    it('should switch to another language (Spanish) via query parameter', async () => {
      const res = await request(app).get('/owners/new?lang=es');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Nuevo Propietario'); // Spanish translation
      expect(res.text).to.include('Agregar Propietario'); // Spanish translation
    });
  });
});

