const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const { sequelize, Vet, Specialty } = require('../models');
const vetController = require('../controllers/vetController');

const app = express();
i18n.configure({ locales: ['en'], directory: path.join(__dirname, '../locales') });
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(i18n.init);

app.get('/vets.html', vetController.listHtml);
app.get('/vets', vetController.listJson);

describe('Vet Controller Integration', () => {
  before(async () => {
    await sequelize.sync({ force: true });
    const v = await Vet.create({ firstName: 'James', lastName: 'Carter' });
    const s = await Specialty.create({ name: 'radiology' });
    await v.addSpecialties([s]);
  });

  it('GET /vets.html should render HTML list', async () => {
    const res = await request(app).get('/vets.html');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('James Carter');
    expect(res.text).to.contain('radiology');
  });

  it('GET /vets should return JSON data', async () => {
    const res = await request(app).get('/vets');
    expect(res.status).to.equal(200);
    expect(res.body.vetList).to.be.an('array');
    expect(res.body.vetList[0].lastName).to.equal('Carter');
    expect(res.body.vetList[0].specialties[0].name).to.equal('radiology');
  });

  it('GET /vets.html pagination should work', async () => {
    // Create many vets
    for(let i=0; i<10; i++) await Vet.create({ firstName: 'Vet', lastName: i.toString() });
    
    const res = await request(app).get('/vets.html?page=2');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Page 2 of 3');
  });
});
