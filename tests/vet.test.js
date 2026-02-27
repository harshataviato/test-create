const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const webRoutes = require('../routes/web');
const { sequelize, Vet, Specialty } = require('../models');

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

describe('Vet Controller', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
    const surgery = await Specialty.create({ name: 'surgery' });
    const vet = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
    await vet.addSpecialty(surgery);
  });

  it('GET /vets should return JSON when requested', async () => {
    const res = await request(app)
      .get('/vets')
      .set('Accept', 'application/json');
    
    expect(res.status).to.equal(200);
    expect(res.body.vetList).to.be.an('array');
    expect(res.body.vetList[0].firstName).to.equal('Helen');
    expect(res.body.vetList[0].specialties[0].name).to.equal('surgery');
  });

  it('GET /vets.html should return HTML', async () => {
    const res = await request(app).get('/vets.html');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Veterinarians');
  });
});
