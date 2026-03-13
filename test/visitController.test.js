const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const { sequelize, Owner, Pet, PetType, Visit } = require('../models');
const visitController = require('../controllers/visitController');

const app = express();
i18n.configure({ locales: ['en'], directory: path.join(__dirname, '../locales') });
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.urlencoded({ extended: true }));
app.use(i18n.init);
app.use('/owners/:ownerId/pets/:petId/visits', visitController);

describe('Visit Controller Integration', () => {
  let owner, pet;

  before(async () => {
    await sequelize.sync({ force: true });
    owner = await Owner.create({ firstName: 'Visit', lastName: 'Tester' });
    const type = await PetType.create({ name: 'cat' });
    pet = await Pet.create({ name: 'Tabby', ownerId: owner.id, typeId: type.id });
  });

  it('GET /new should render visit form', async () => {
    const res = await request(app).get(`/owners/${owner.id}/pets/${pet.id}/visits/new`);
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Add Visit');
  });

  it('POST /new should create visit', async () => {
    const res = await request(app)
      .post(`/owners/${owner.id}/pets/${pet.id}/visits/new`)
      .send({ date: '2023-11-11', description: 'Annual vaccination' });
    
    expect(res.status).to.equal(302);
    const visit = await Visit.findOne({ where: { description: 'Annual vaccination' } });
    expect(visit).to.not.be.null;
    expect(visit.petId).to.equal(pet.id.toString());
  });
});
