const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const { sequelize, Owner, PetType, Pet } = require('../models');
const petController = require('../controllers/petController');

const app = express();
i18n.configure({ locales: ['en'], directory: path.join(__dirname, '../locales') });
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.urlencoded({ extended: true }));
app.use(i18n.init);
app.use('/owners/:ownerId/pets', petController);

describe('Pet Controller Integration', () => {
  let owner, type;

  before(async () => {
    await sequelize.sync({ force: true });
    owner = await Owner.create({ firstName: 'Peter', lastName: 'Parker' });
    type = await PetType.create({ name: 'spider' });
  });

  it('GET /owners/:id/pets/new should render pet form', async () => {
    const res = await request(app).get(`/owners/${owner.id}/pets/new`);
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Add New Pet');
  });

  it('POST /owners/:id/pets/new should create pet', async () => {
    const res = await request(app)
      .post(`/owners/${owner.id}/pets/new`)
      .send({ name: 'Itsy Bitsy', birthDate: '2023-01-01', type: type.id });
    
    expect(res.status).to.equal(302);
    const pet = await Pet.findOne({ where: { name: 'Itsy Bitsy' } });
    expect(pet).to.not.be.null;
    expect(pet.ownerId).to.equal(owner.id.toString());
  });

  it('POST /owners/:id/pets/:petId/edit should update pet', async () => {
    const pet = await Pet.findOne();
    const res = await request(app)
      .post(`/owners/${owner.id}/pets/${pet.id}/edit`)
      .send({ name: 'Updated Name', type: type.id });
    
    expect(res.status).to.equal(302);
    await pet.reload();
    expect(pet.name).to.equal('Updated Name');
  });
});
