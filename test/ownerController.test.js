const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const methodOverride = require('method-override');
const { sequelize, Owner } = require('../models');
const ownerController = require('../controllers/ownerController');

// Setup a test app instance
const app = express();
i18n.configure({
  locales: ['en'],
  directory: path.join(__dirname, '../locales'),
  defaultLocale: 'en'
});
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(i18n.init);
app.use((req, res, next) => { res.locals.url = req.url; next(); });
app.use('/owners', ownerController);

describe('Owner Controller Integration', () => {
  before(async () => {
    await sequelize.sync({ force: true });
    await Owner.create({ firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty', city: 'Madison', telephone: '6085551023' });
    await Owner.create({ firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave', city: 'Sun Prairie', telephone: '6085551749' });
  });

  it('GET /owners/find should render find page', async () => {
    const res = await request(app).get('/owners/find');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Find Owners');
  });

  it('GET /owners (Search) - should redirect if exactly one owner found', async () => {
    const res = await request(app).get('/owners?lastName=Franklin');
    expect(res.status).to.equal(302);
    expect(res.header.location).to.match(/\/owners\/\d+/);
  });

  it('GET /owners (Search) - should show list if multiple found', async () => {
    // Add another Franklin
    await Owner.create({ firstName: 'Ben', lastName: 'Franklin', address: '123 St', city: 'Philly', telephone: '1234567890' });
    const res = await request(app).get('/owners?lastName=Franklin');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('George Franklin');
    expect(res.text).to.contain('Ben Franklin');
  });

  it('GET /owners (Search) - should show error if none found', async () => {
    const res = await request(app).get('/owners?lastName=NonExistent');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('notFound');
  });

  it('POST /owners/new - should fail validation with invalid data', async () => {
    const res = await request(app)
      .post('/owners/new')
      .send({ firstName: '', lastName: '', telephone: '123' });
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Add Owner'); // Stays on form
  });

  it('POST /owners/new - should create owner with valid data', async () => {
    const res = await request(app)
      .post('/owners/new')
      .send({
        firstName: 'Test',
        lastName: 'User',
        address: '123 Test St',
        city: 'Test City',
        telephone: '1234567890'
      });
    expect(res.status).to.equal(302);
    const owners = await Owner.findAll({ where: { lastName: 'User' } });
    expect(owners.length).to.equal(1);
  });

  it('GET /owners/:id - should show owner details', async () => {
    const owner = await Owner.findOne();
    const res = await request(app).get(`/owners/${owner.id}`);
    expect(res.status).to.equal(200);
    expect(res.text).to.contain(owner.firstName);
  });
});
