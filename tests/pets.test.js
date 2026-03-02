const request = require('supertest');
const express = require('express');
const path = require('path');
const { expect } = require('chai');
const db = require('../models');
const routes = require('../routes');

describe('Pet Controller & Routes', () => {
  let app;
  let ownerId;
  let typeId;

  before(async () => {
    app = express();
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));
    app.use(express.urlencoded({ extended: true }));
    app.use('/', routes);

    await db.sequelize.sync({ force: true });
    await db.seed();
    
    const owner = await db.Owner.findOne();
    ownerId = owner.id;
    const type = await db.PetType.findOne();
    typeId = type.id;
  });

  describe('GET /owners/:ownerId/pets/new', () => {
    it('should render pet creation form', async () => {
      const res = await request(app).get(`/owners/${ownerId}/pets/new`);
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('New Pet');
    });
  });

  describe('POST /owners/:ownerId/pets/new', () => {
    it('should create pet and redirect', async () => {
      const res = await request(app)
        .post(`/owners/${ownerId}/pets/new`)
        .send({
          name: 'Rex',
          birthDate: '2022-01-01',
          typeId: typeId
        });
      expect(res.status).to.equal(302);
      expect(res.header.location).to.equal(`/owners/${ownerId}`);
    });

    it('should fail if pet name is duplicated for same owner', async () => {
      await db.Pet.create({ name: 'Unique', birthDate: '2020-01-01', owner_id: ownerId, type_id: typeId });
      const res = await request(app)
        .post(`/owners/${ownerId}/pets/new`)
        .send({
          name: 'Unique',
          birthDate: '2022-01-01',
          typeId: typeId
        });
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Pet name already exists');
    });
  });

  describe('POST /owners/:ownerId/pets/:petId/edit', () => {
    it('should update pet information', async () => {
      const pet = await db.Pet.findOne({ where: { owner_id: ownerId } });
      const res = await request(app)
        .post(`/owners/${ownerId}/pets/${pet.id}/edit`)
        .send({
          name: 'RexUpdated',
          birthDate: '2022-01-02',
          typeId: typeId
        });
      expect(res.status).to.equal(302);
      const updated = await db.Pet.findByPk(pet.id);
      expect(updated.name).to.equal('RexUpdated');
    });
  });
});
