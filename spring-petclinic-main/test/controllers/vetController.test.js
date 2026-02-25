/**
 * @file test/controllers/vetController.test.js
 * @description Automated tests for vetController routes and caching.
 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const app = require('../../app'); // Your Express app
const { Vet, Specialty, sequelize } = require('../../models');
const { resetAndSeedDatabase } = require('../helpers');
const NodeCache = require('node-cache'); // Access NodeCache directly for mocking
const vetController = require('../../controllers/vetController'); // To mock cache methods

describe('VetController', () => {
  let server;
  let vetCacheStub;

  before(async () => {
    server = app.listen(0); // Start the server on a random port for supertest
    await resetAndSeedDatabase(); // Ensure DB is clean and seeded
  });

  after(async () => {
    await server.close();
    await sequelize.close(); // Close DB connection after all tests
  });

  beforeEach(() => {
    // Stub NodeCache methods used by vetController
    // This assumes vetController has access to the same NodeCache instance.
    // In vetController, the cache is created at the top level.
    // To mock it, we need to re-require the module after mocking, or pass a mock instance.
    // For simplicity, we'll try to directly stub the methods of the existing cache.
    // This is a bit brittle, a better approach would be to inject the cache into the controller.

    // Reload the module to get a fresh instance that we can control
    // if NodeCache is tightly coupled. If it's a global singleton, direct stubbing works.
    // Given the way vetController uses `const vetCache = new NodeCache(...)` it's a singleton within the module.
    // This means we can directly stub the methods on the instance.
    // We need to access the private variable `vetCache` from the controller.
    // This is generally bad practice, but for testing, it's often necessary if not designed for injection.

    // A more robust approach would be to make `vetCache` accessible or inject it.
    // For now, I'll rely on inspecting the controller's implementation details.
    // It's a `const vetCache = new NodeCache(...)` at the module level.
    // So, we need to ensure the cache is cleared or mocked.
    vetCacheStub = sinon.stub(NodeCache.prototype, 'get');
    sinon.stub(NodeCache.prototype, 'set');
    NodeCache.prototype.flushAll(); // Clear any existing cache entries
  });

  afterEach(() => {
    sinon.restore(); // Restore all stubs after each test
  });


  describe('HTML Vet List', () => {
    it('GET /vets.html should render the vet list with pagination', async () => {
      const res = await request(app).get('/vets.html');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Veterinarians');
      expect(res.text).to.include('James Carter'); // First vet
      expect(res.text).to.include('Helen Leary');
      // Ensure pagination links are present
      expect(res.text).to.include('pagination');
      expect(res.text).to.include('Page 1 of 2'); // 6 vets, page size 5
    });

    it('GET /vets.html?page=2 should display the second page of vets', async () => {
      const res = await request(app).get('/vets.html?page=2');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Sharon Jenkins'); // Last vet
      expect(res.text).to.not.include('James Carter'); // Should not be on page 2
      expect(res.text).to.include('Page 2 of 2');
    });

    it('GET /vets.html should handle out-of-bounds page numbers gracefully', async () => {
      const res = await request(app).get('/vets.html?page=99');
      expect(res.statusCode).to.equal(200);
      // It should default to page 1 or show an empty list depending on implementation.
      // Current implementation shows page 1 if offset is beyond count for an empty last name search.
      // For vet list, it's safer to ensure it just doesn't crash and returns an empty list or the last page.
      // In this case, it will show the last page (page 2) or default to page 1 if no results found for offset.
      expect(res.text).to.include('Sharon Jenkins'); // Last page content
    });
  });

  describe('JSON Vet List and Caching', () => {
    it('GET /vets should return a JSON list of vets and populate cache', async () => {
      vetCacheStub.withArgs('vets').returns(undefined); // Simulate cache miss

      const res = await request(app).get('/vets');
      expect(res.statusCode).to.equal(200);
      expect(res.body.vetList).to.be.an('array');
      expect(res.body.vetList).to.have.lengthOf(6); // All seeded vets
      expect(res.body.vetList[0].firstName).to.equal('James');
      expect(vetCacheStub.withArgs('vets').calledOnce).to.be.true; // Check that 'get' was called for cache miss

      // Check that `set` was called to store data in cache
      expect(NodeCache.prototype.set.withArgs('vets', sinon.match.array).calledOnce).to.be.true;
    });

    it('GET /vets should return a JSON list of vets from cache on subsequent calls', async () => {
      const cachedVets = [{ id: 100, firstName: 'Cached', lastName: 'Vet', specialties: [] }];
      vetCacheStub.withArgs('vets').returns(cachedVets); // Simulate cache hit

      const res = await request(app).get('/vets');
      expect(res.statusCode).to.equal(200);
      expect(res.body.vetList).to.deep.equal(cachedVets);
      expect(vetCacheStub.withArgs('vets').calledOnce).to.be.true; // Check that 'get' was called
      // Ensure `set` was not called again if data was retrieved from cache
      expect(NodeCache.prototype.set.notCalled).to.be.true;
    });

    it('GET /vets should handle database errors gracefully for JSON endpoint', async () => {
      // Stub the findAll method of the Vet model to simulate a DB error
      const findAllStub = sinon.stub(Vet, 'findAll').throws(new Error('Database connection lost'));

      const res = await request(app).get('/vets');
      expect(res.statusCode).to.equal(500); // Expect an internal server error
      expect(res.text).to.include('Something bad happened'); // General error message
      findAllStub.restore(); // Clean up the stub
    });
  });

  describe('i18n Middleware Integration', () => {
    it('should display vet list in default language (English)', async () => {
      const res = await request(app).get('/vets.html');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Veterinarians');
      expect(res.text).to.include('Specialties');
    });

    it('should switch vet list to Spanish via query parameter', async () => {
      const res = await request(app).get('/vets.html?lang=es');
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('Veterinarios'); // Spanish translation
      expect(res.text).to.include('Especialidades'); // Spanish translation
    });
  });
});

