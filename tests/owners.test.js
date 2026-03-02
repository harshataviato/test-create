const request = require('supertest');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const { expect } = require('chai');
const db = require('../models');
const routes = require('../routes');

describe('Owner Controller & Routes', () => {
  let app;

  before(async () => {
    app = express();
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride('_method'));
    app.use('/', routes);

    await db.sequelize.sync({ force: true });
    await db.seed();
  });

  describe('GET /owners/find', () => {
    it('should render the find owners form', async () => {
      const res = await request(app).get('/owners/find');
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Find Owners');
    });
  });

  describe('GET /owners (Search Logic)', () => {
    it('should redirect to details if only one owner is found', async () => {
      // Franklin is seeded by default
      const res = await request(app).get('/owners?lastName=Franklin');
      expect(res.status).to.equal(302);
      expect(res.header.location).to.match(/\/owners\/\d+/);
    });

    it('should show list if multiple owners match', async () => {
      await db.Owner.create({ firstName: 'A', lastName: 'Franklin2', address: '1', city: '1', telephone: '1111111111' });
      const res = await request(app).get('/owners?lastName=Franklin');
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Owners');
    });

    it('should show error if no owner found', async () => {
      const res = await request(app).get('/owners?lastName=NonExistent');
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Not found');
    });
  });

  describe('POST /owners/new', () => {
    it('should create a new owner and redirect', async () => {
      const res = await request(app)
        .post('/owners/new')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          address: 'Main St',
          city: 'London',
          telephone: '0987654321'
        });
      expect(res.status).to.equal(302);
      const owner = await db.Owner.findOne({ where: { lastName: 'Doe' } });
      expect(owner).to.not.be.null;
    });

    it('should return form with errors on invalid input', async () => {
      const res = await request(app)
        .post('/owners/new')
        .send({ firstName: 'Short' }); // missing fields
      expect(res.status).to.equal(200);
    });
  });

  describe('GET /owners/:id/edit', () => {
    it('should load update form', async () => {
      const owner = await db.Owner.findOne();
      const res = await request(app).get(`/owners/${owner.id}/edit`);
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Update Owner');
    });
  });

  describe('POST /owners/:id/edit', () => {
    it('should update owner and redirect', async () => {
      const owner = await db.Owner.findOne();
      const res = await request(app)
        .post(`/owners/${owner.id}/edit`)
        .send({
          firstName: 'Updated',
          lastName: owner.lastName,
          address: owner.address,
          city: owner.city,
          telephone: owner.telephone
        });
      expect(res.status).to.equal(302);
      const updated = await db.Owner.findByPk(owner.id);
      expect(updated.firstName).to.equal('Updated');
    });
  });
});
