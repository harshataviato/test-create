const request = require('supertest');
const express = require('express');
const path = require('path');
const { expect } = require('chai');
const db = require('../models');
const routes = require('../routes');

describe('Visit & Vet Routes', () => {
  let app;

  before(async () => {
    app = express();
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));
    app.use(express.urlencoded({ extended: true }));
    app.use('/', routes);

    await db.sequelize.sync({ force: true });
    await db.seed();
  });

  describe('Visits', () => {
    it('should render new visit form', async () => {
      const owner = await db.Owner.findOne();
      const pet = await db.Pet.findOne({ where: { owner_id: owner.id } });
      const res = await request(app).get(`/owners/${owner.id}/pets/${pet.id}/visits/new`);
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('New Visit');
    });

    it('should process new visit form successfully', async () => {
      const owner = await db.Owner.findOne();
      const pet = await db.Pet.findOne({ where: { owner_id: owner.id } });
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/${pet.id}/visits/new`)
        .send({
          visitDate: '2023-12-01',
          description: 'Regular Vaccination'
        });
      expect(res.status).to.equal(302);
      
      const visit = await db.Visit.findOne({ where: { description: 'Regular Vaccination' } });
      expect(visit).to.not.be.null;
    });

    it('should show error on validation failure', async () => {
      const owner = await db.Owner.findOne();
      const pet = await db.Pet.findOne({ where: { owner_id: owner.id } });
      const res = await request(app)
        .post(`/owners/${owner.id}/pets/${pet.id}/visits/new`)
        .send({
          description: '' // Assuming description is required
        });
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Validation failed');
    });
  });

  describe('Vets', () => {
    it('should list all veterinarians', async () => {
      const res = await request(app).get('/vets.html');
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Veterinarians');
      expect(res.text).to.contain('James Carter'); // seeded vet
    });
  });

  describe('System', () => {
    it('should render welcome page', async () => {
      const res = await request(app).get('/');
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Welcome');
    });

    it('should handle expected errors (oups)', async () => {
      const res = await request(app).get('/oups');
      // The centralized error handler in app.js renders 'error' with status 500
      expect(res.status).to.equal(500);
      expect(res.text).to.contain('Something happened');
    });
  });
});
