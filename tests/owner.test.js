const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const webRoutes = require('../routes/web');
const { sequelize, Owner, Pet, PetType } = require('../models');

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

describe('Owner Controller & Routes', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  it('GET /owners/new should show creation form', async () => {
    const res = await request(app).get('/owners/new');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Owner');
  });

  it('POST /owners/new should create owner and redirect', async () => {
    const res = await request(app)
      .post('/owners/new')
      .type('form')
      .send({
        firstName: 'Franklin',
        lastName: 'Clinton',
        address: 'Vinewood',
        city: 'Los Santos',
        telephone: '1112223333'
      });
    
    expect(res.status).to.equal(302);
    const owner = await Owner.findOne({ where: { lastName: 'Clinton' } });
    expect(owner).to.not.be.null;
    expect(res.headers.location).to.equal(`/owners/${owner.id}`);
  });

  it('GET /owners should find by last name and redirect if single result', async () => {
    await Owner.create({
        firstName: 'George', lastName: 'Franklin', address: '110 W Liberty', 
        city: 'Madison', telephone: '6085551023'
    });

    const res = await request(app).get('/owners?lastName=Franklin');
    expect(res.status).to.equal(302);
    expect(res.headers.location).to.match(/\/owners\/\d+/);
  });

  it('GET /owners should show list if multiple results found', async () => {
    await Owner.create({ firstName: 'A', lastName: 'Smith', address: 'X', city: 'X', telephone: '1234567890' });
    await Owner.create({ firstName: 'B', lastName: 'Smith', address: 'Y', city: 'Y', telephone: '0987654321' });

    const res = await request(app).get('/owners?lastName=Smith');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Smith');
  });

  it('GET /owners should show error if not found', async () => {
    const res = await request(app).get('/owners?lastName=DoesNotExist');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('has not been found');
  });

  it('GET /owners/:id should show owner details with pets', async () => {
    const owner = await Owner.create({ firstName: 'G', lastName: 'F', address: 'X', city: 'X', telephone: '1234567890' });
    const type = await PetType.create({ name: 'dog' });
    await Pet.create({ name: 'Rosco', birthDate: '2020-01-01', ownerId: owner.id, typeId: type.id });

    const res = await request(app).get(`/owners/${owner.id}`);
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Rosco');
  });
});
