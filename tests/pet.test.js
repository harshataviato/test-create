const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const webRoutes = require('../routes/web');
const { sequelize, Owner, Pet, PetType, Visit } = require('../models');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use((req, res, next) => {
    const render = res.render;
    res.render = function(view, options, fn) {
        render.call(this, view, options, (err, html) => {
            if (err) return fn ? fn(err) : next(err);
            render.call(this, 'fragments/layout', { ...options, body: html }, fn);
        });
    };
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', webRoutes);

describe('Pet & Visit Controller', () => {
  let owner, type;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    type = await PetType.create({ name: 'cat' });
    owner = await Owner.create({
      firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave',
      city: 'Sun Prairie', telephone: '6085551749'
    });
  });

  it('POST /owners/:id/pets/new should add pet to owner', async () => {
    const res = await request(app)
      .post(`/owners/${owner.id}/pets/new`)
      .type('form')
      .send({ name: 'Leo', birthDate: '2022-05-05', typeId: type.id });

    expect(res.status).to.equal(302);
    const pets = await Pet.findAll({ where: { ownerId: owner.id } });
    expect(pets.length).to.equal(1);
    expect(pets[0].name).to.equal('Leo');
  });

  it('POST /owners/:id/pets/:petId/visits/new should add visit to pet', async () => {
    const pet = await Pet.create({ name: 'Leo', birthDate: '2022-05-05', ownerId: owner.id, typeId: type.id });
    
    const res = await request(app)
      .post(`/owners/${owner.id}/pets/${pet.id}/visits/new`)
      .type('form')
      .send({ visitDate: '2023-10-10', description: 'checkup' });

    expect(res.status).to.equal(302);
    const visits = await Visit.findAll({ where: { petId: pet.id } });
    expect(visits.length).to.equal(1);
    expect(visits[0].description).to.equal('checkup');
  });
});
