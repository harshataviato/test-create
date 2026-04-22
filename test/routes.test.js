const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const { sequelize, Owner, PetType, Vet, Specialty, Pet } = require('../models');

// We reconstruct the app instance for testing to avoid the production server's listen() call
const app = express();

i18n.configure({
  locales: ['en'],
  directory: path.join(__dirname, '../locales'),
  defaultLocale: 'en',
  register: global
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(i18n.init);
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use('/', require('../routes/welcome'));
app.use('/owners', require('../routes/owner'));
app.use('/vets', require('../routes/vet'));

// Error route for testing 500
app.get('/oups', (req, res) => { throw new Error('Test Error'); });

app.use((err, req, res, next) => {
  res.status(500).render('error', { status: 500, message: err.message });
});

describe('Route & Controller Integration Tests', () => {
  
  before(async () => {
    // Reset database and seed minimal data for route tests
    await sequelize.sync({ force: true });
    const dog = await PetType.create({ name: 'dog' });
    const owner = await Owner.create({
      firstName: 'George',
      lastName: 'Franklin',
      address: '110 W. Liberty St.',
      city: 'Madison',
      telephone: '6085551023'
    });
    await Pet.create({
        name: 'Leo',
        birthDate: '2010-09-07',
        type_id: dog.id,
        owner_id: owner.id
    });
    await Vet.create({ firstName: 'James', lastName: 'Carter' });
  });

  describe('Welcome Route', () => {
    it('GET / should return 200 and welcome text', async () => {
      const res = await request(app).get('/');
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Welcome');
    });
  });

  describe('Owner Routes', () => {
    it('GET /owners/find should show search form', async () => {
      const res = await request(app).get('/owners/find');
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Find Owners');
    });

    it('GET /owners with lastName should find owners (1 result redirect)', async () => {
      const res = await request(app).get('/owners?lastName=Franklin');
      // Should redirect to details page because count is 1
      expect(res.status).to.equal(302);
      expect(res.header.location).to.match(/\/owners\/\d+/);
    });

    it('GET /owners with non-existent lastName should return find form with error', async () => {
      const res = await request(app).get('/owners?lastName=Unknown');
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('has not been found');
    });

    it('POST /owners/new with valid data should create owner and redirect', async () => {
      const res = await request(app)
        .post('/owners/new')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          address: '456 side st',
          city: 'Chicago',
          telephone: '1231231234'
        });
      expect(res.status).to.equal(302);
    });

    it('POST /owners/new with invalid telephone should stay on page', async () => {
      const res = await request(app)
        .post('/owners/new')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          address: '456 side st',
          city: 'Chicago',
          telephone: '123'
        });
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Add Owner'); // Form title preserved
    });

    it('GET /owners/:id should return owner details', async () => {
      const owner = await Owner.findOne();
      const res = await request(app).get(`/owners/${owner.id}`);
      expect(res.status).to.equal(200);
      expect(res.text).to.contain(owner.lastName);
      expect(res.text).to.contain('Leo'); // Associated pet
    });
  });

  describe('Pet Routes', () => {
    it('POST /owners/:ownerId/pets/new should add pet', async () => {
      const owner = await Owner.findOne();
      const type = await PetType.findOne();
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/new`)
        .send({
          name: 'Spot',
          birthDate: '2022-01-01',
          typeId: type.id
        });
      expect(res.status).to.equal(302);
      
      const pet = await Pet.findOne({ where: { name: 'Spot' } });
      expect(pet).to.not.be.null;
    });

    it('POST /owners/:ownerId/pets/:petId/edit should update pet', async () => {
      const pet = await Pet.findOne();
      const owner = await Owner.findOne();
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/${pet.id}/edit`)
        .send({
          name: 'UpdatedName',
          birthDate: '2022-01-01',
          typeId: pet.type_id
        });
      expect(res.status).to.equal(302);
      await pet.reload();
      expect(pet.name).to.equal('UpdatedName');
    });
  });

  describe('Visit Routes', () => {
    it('POST /owners/:ownerId/pets/:petId/visits/new should add visit', async () => {
      const pet = await Pet.findOne();
      const owner = await Owner.findOne();
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/${pet.id}/visits/new`)
        .send({
          description: 'Rabies booster',
          date: '2023-11-11'
        });
      expect(res.status).to.equal(302);
      
      const petWithVisits = await Pet.findByPk(pet.id, { include: ['visits'] });
      expect(petWithVisits.visits).to.have.length.at.least(1);
    });
  });

  describe('Vet Routes', () => {
    it('GET /vets should list vets', async () => {
      const res = await request(app).get('/vets');
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('James Carter');
    });
  });

  describe('Error Handling', () => {
    it('GET /oups should trigger 500 error page', async () => {
      const res = await request(app).get('/oups');
      expect(res.status).to.equal(500);
      expect(res.text).to.contain('Something happened');
    });

    it('GET /non-existent-page should return 404', async () => {
      // Re-adding 404 handler for this specific test app instance
      app.use((req, res) => {
        res.status(404).render('error', { status: 404, message: 'Not Found' });
      });
      const res = await request(app).get('/notfound');
      expect(res.status).to.equal(404);
    });
  });
});
