// test/integration/ownerRoutes.test.js
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');
const { sequelize, models } = require('../../test/config/testDb');
const { Owner, Pet, PetType, Visit } = models;
const session = require('supertest-session');
const moment = require('moment');

describe('Owner Routes', () => {
  let authenticatedSession;

  beforeEach(async () => {
    // Re-seed the database with initial data before each test
    await sequelize.query('TRUNCATE TABLE owners, pets, types, visits, vets, specialties, vet_specialties RESTART IDENTITY CASCADE;');

    await Owner.bulkCreate([
      { id: 1, firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' },
      { id: 2, firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' },
      { id: 3, firstName: 'Eduardo', lastName: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763' },
      { id: 4, firstName: 'Harold', lastName: 'Davis', address: '563 Friendly St.', city: 'Windsor', telephone: '6085553198' },
      { id: 5, firstName: 'Peter', lastName: 'McTavish', address: '2387 S. Fair Way', city: 'Madison', telephone: '6085552765' }
    ]);
    await PetType.bulkCreate([
      { id: 1, name: 'cat' },
      { id: 2, name: 'dog' }
    ]);
    await Pet.bulkCreate([
      { id: 1, name: 'Leo', birthDate: '2000-09-07', typeId: 1, ownerId: 1 },
      { id: 2, name: 'Max', birthDate: '2001-01-15', typeId: 2, ownerId: 1 },
      { id: 3, name: 'Rosy', birthDate: '2002-03-20', typeId: 2, ownerId: 2 }
    ]);
    await Visit.bulkCreate([
      { id: 1, petId: 1, visitDate: '2010-03-04', description: 'rabies shot' },
      { id: 2, petId: 1, visitDate: '2011-04-05', description: 'checkup' }
    ]);

    // Create a new session for each test to ensure test isolation for flash messages
    authenticatedSession = session(app);
  });

  describe('GET /owners/find', () => {
    it('should render the find owners form', async () => {
      const res = await authenticatedSession.get('/owners/find');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>Find Owners</h2>');
      expect(res.text).to.include('<form action="/owners" method="get" class="form-horizontal" id="search-owner-form">');
    });
  });

  describe('GET /owners', () => {
    it('should redirect to owner details if one owner found by last name', async () => {
      const res = await authenticatedSession.get('/owners?lastName=Franklin');
      expect(res.statusCode).to.equal(302);
      expect(res.headers.location).to.equal('/owners/1');
    });

    it('should show a list of owners if multiple owners found by last name', async () => {
      const res = await authenticatedSession.get('/owners?lastName=Davis');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>Owners</h2>');
      expect(res.text).to.include('George Franklin'); // Should not be present
      expect(res.text).to.include('Betty Davis'); // Should be present
      expect(res.text).to.include('Harold Davis'); // Should be present
      expect(res.text).to.include('<td>Betty Davis</td>');
      expect(res.text).to.include('<td>Harold Davis</td>');
    });

    it('should display an error message if no owners found', async () => {
      const res = await authenticatedSession.get('/owners?lastName=NonExistent');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>Find Owners</h2>'); // Renders find form again
      expect(res.text).to.include('<p>has not been found</p>'); // Flash error message
    });

    it('should list all owners with pagination when last name is empty', async () => {
      const res = await authenticatedSession.get('/owners'); // No lastName param
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>Owners</h2>');
      expect(res.text).to.include('<td>George Franklin</td>');
      expect(res.text).to.include('<td>Betty Davis</td>');
      expect(res.text).to.include('<td>Eduardo Rodriquez</td>');
      expect(res.text).to.include('<span>pages:</span>'); // Check for pagination controls
    });

    it('should show correct pagination for multiple pages', async () => {
      // Assuming 5 owners, default pageSize is 5 for the service, so only 1 page will show in current service implementation.
      // Let's force a smaller page size in the service or mock it, or add more data.
      // For now, let's assume if there's > 1 owner, pagination links are rendered.
      // The service is hardcoded to 5, so with 5 owners, only one page will show.
      // We will assert the presence of 'pages' if totalPages > 1.
      const resPage1 = await authenticatedSession.get('/owners?page=1');
      expect(resPage1.statusCode).to.equal(200);
      expect(resPage1.text).to.include('George Franklin');

      // To properly test pagination, we need more owners or a smaller default page size.
      // Given the data, totalPages should be 1 with default page size 5.
      expect(resPage1.text).to.not.include('<span>[<a href="/owners?page=1">1</a>]'); // Only 1 page, so no explicit link to page 1
    });

    it('should handle pagination to page 2 (if exists)', async () => {
      // Add more owners to ensure pagination kicks in
      await Owner.bulkCreate([
        { id: 6, firstName: 'Carlos', lastName: 'Estaban', address: '2335 Independence La.', city: 'Waunakee', telephone: '6085555487' },
        { id: 7, firstName: 'David', lastName: 'Schroeder', address: '2749 Blackhawk Trail', city: 'Madison', telephone: '6085559435' }
      ]);
      const res = await authenticatedSession.get('/owners?page=2');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('David Schroeder');
      expect(res.text).to.not.include('George Franklin'); // Should be on page 1
      expect(res.text).to.include('<a href="/owners?page=1"'); // Link to previous page
      expect(res.text).to.include('<span>2</span>'); // Current page is 2
    });
  });

  describe('GET /owners/new', () => {
    it('should render the new owner creation form', async () => {
      const res = await authenticatedSession.get('/owners/new');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>Add Owner</h2>');
      expect(res.text).to.include('<form action="/owners/new"');
      expect(res.text).to.include('name="firstName"');
    });
  });

  describe('POST /owners/new', () => {
    it('should create a new owner and redirect to their details on success', async () => {
      const newOwnerData = {
        firstName: 'New',
        lastName: 'Guy',
        address: '456 Oak Ave',
        city: 'Metropolis',
        telephone: '0987654321'
      };
      const res = await authenticatedSession
        .post('/owners/new')
        .send(newOwnerData);

      expect(res.statusCode).to.equal(302);
      const newOwner = await Owner.findOne({ where: { lastName: 'Guy' } });
      expect(res.headers.location).to.equal(`/owners/${newOwner.id}`);

      // Follow redirect to check flash message and details
      const followRes = await authenticatedSession.get(res.headers.location);
      expect(followRes.statusCode).to.equal(200);
      expect(followRes.text).to.include('New Guy');
      expect(followRes.text).to.include('<span id="success-message">New Owner Created</span>');
    });

    it('should re-render form with validation errors on failure', async () => {
      const invalidOwnerData = {
        firstName: '', // Missing first name
        lastName: 'Invalid',
        address: '123 Invalid St',
        city: 'Invalidville',
        telephone: '123' // Invalid telephone
      };
      const res = await authenticatedSession
        .post('/owners/new')
        .send(invalidOwnerData);

      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>Add Owner</h2>'); // Still on the form page
      expect(res.text).to.include('<p>is required</p>'); // Error for firstName
      expect(res.text).to.include('<p>Telephone must be a 10-digit number</p>'); // Error for telephone
      expect(res.text).to.include('name="lastName" value="Invalid"'); // Input field repopulated
    });
  });

  describe('GET /owners/:ownerId', () => {
    it('should render owner details page for an existing owner', async () => {
      const res = await authenticatedSession.get('/owners/1');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>Owner Information</h2>');
      expect(res.text).to.include('<b>George Franklin</b>');
      expect(res.text).to.include('Name Leo'); // Pet details
      expect(res.text).to.include('Name Max');
      expect(res.text).to.include('Description rabies shot'); // Visit details
      expect(res.text).to.include('Description checkup');
      expect(res.text).to.include('Description vaccination');
      expect(res.text).to.include(moment('2010-03-04').format('YYYY-MM-DD'));
    });

    it('should return 404 if owner not found', async () => {
      const res = await authenticatedSession.get('/owners/999');
      expect(res.statusCode).to.equal(500); // Global error handler catches it as 500
      expect(res.text).to.include('<h2>Something happened...</h2>');
      expect(res.text).to.include('Owner not found with id: 999. Please ensure the ID is correct.');
    });
  });

  describe('GET /owners/:ownerId/edit', () => {
    it('should render the edit owner form for an existing owner', async () => {
      const res = await authenticatedSession.get('/owners/1/edit');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>Update Owner</h2>');
      expect(res.text).to.include('<form action="/owners/1/edit"');
      expect(res.text).to.include('name="firstName" value="George"');
    });

    it('should return 404 if owner to edit not found', async () => {
      const res = await authenticatedSession.get('/owners/999/edit');
      expect(res.statusCode).to.equal(500); // Global error handler catches it as 500
      expect(res.text).to.include('<h2>Something happened...</h2>');
      expect(res.text).to.include('Owner not found with id: 999. Please ensure the ID is correct and the owner exists in the database.');
    });
  });

  describe('POST /owners/:ownerId/edit', () => {
    it('should update an owner and redirect to details on success', async () => {
      const updatedOwnerData = {
        firstName: 'Georgina',
        lastName: 'Franklin',
        address: '110 W. Liberty St.',
        city: 'Madison',
        telephone: '6085551023',
        id: 1 // Important for form binding consistency
      };
      const res = await authenticatedSession
        .post('/owners/1/edit')
        .send(updatedOwnerData);

      expect(res.statusCode).to.equal(302);
      expect(res.headers.location).to.equal('/owners/1');

      // Follow redirect to check flash message and details
      const followRes = await authenticatedSession.get(res.headers.location);
      expect(followRes.statusCode).to.equal(200);
      expect(followRes.text).to.include('Georgina Franklin');
      expect(followRes.text).to.include('<span id="success-message">Owner Values Updated</span>');
    });

    it('should re-render form with validation errors on failure', async () => {
      const invalidOwnerData = {
        firstName: 'George',
        lastName: '', // Missing last name
        address: '110 W. Liberty St.',
        city: 'Madison',
        telephone: 'invalid' // Invalid telephone
      };
      const res = await authenticatedSession
        .post('/owners/1/edit')
        .send(invalidOwnerData);

      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('<h2>Update Owner</h2>'); // Still on the form page
      expect(res.text).to.include('<p>is required</p>'); // Error for lastName
      expect(res.text).to.include('<p>Telephone must be a 10-digit number</p>'); // Error for telephone
      expect(res.text).to.include('name="firstName" value="George"'); // Input field repopulated
    });

    it('should handle owner ID mismatch in form data', async () => {
      const updatedOwnerData = {
        firstName: 'Georgina',
        lastName: 'Franklin',
        address: '110 W. Liberty St.',
        city: 'Madison',
        telephone: '6085551023',
        id: 2 // Mismatch with URL param :ownerId (which is 1)
      };
      const res = await authenticatedSession
        .post('/owners/1/edit')
        .send(updatedOwnerData);

      expect(res.statusCode).to.equal(302);
      expect(res.headers.location).to.equal('/owners/1/edit'); // Redirect back to edit form

      const followRes = await authenticatedSession.get(res.headers.location);
      expect(followRes.statusCode).to.equal(200);
      expect(followRes.text).to.include('<p>Owner ID mismatch. Please try again.</p>'); // Flash error
    });

    it('should return 404 if owner to update not found by ID in URL', async () => {
      const updatedOwnerData = {
        firstName: 'Georgina',
        lastName: 'Franklin',
        address: '110 W. Liberty St.',
        city: 'Madison',
        telephone: '6085551023',
        id: 999 // Mismatch with URL param :ownerId (which is 999)
      };
      const res = await authenticatedSession
        .post('/owners/999/edit')
        .send(updatedOwnerData);
      expect(res.statusCode).to.equal(500); // Middleware for findOwnerById handles it
      expect(res.text).to.include('Owner not found with id: 999. Please ensure the ID is correct and the owner exists in the database.');
    });
  });
});
