const request = require('supertest');
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const { sequelize, Owner, PetType, Vet, Specialty } = require('../models');

// We recreate the app instance to avoid port binding issues during testing
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'fragments/layout');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  res.locals.messages = require('../locales/messages_en.json');
  next();
});

app.use('/', require('../routes/welcome'));
app.use('/owners', require('../routes/owners'));
app.use('/vets', require('../routes/vets'));
app.use('/owners', require('../routes/visits'));

app.get('/oups', (req, res) => {
  throw new Error("Expected: controller used to showcase what happens when an exception is thrown");
});

app.use((err, req, res, next) => {
  res.status(500).render('welcome', { menu: 'error', message: err.message });
});

describe('Web Routes and Controllers', () => {
  beforeAll(async () => {
    process.env.DB_STORAGE = ':memory:';
    await sequelize.sync({ force: true });
    
    // Seed basic data for route testing
    const cat = await PetType.create({ name: 'cat' });
    const owner = await Owner.create({
      firstName: 'George',
      lastName: 'Franklin',
      address: '110 W. Liberty St.',
      city: 'Madison',
      telephone: '6085551023'
    });
    const vet = await Vet.create({ firstName: 'James', lastName: 'Carter' });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Welcome Route', () => {
    it('should GET / and return 200', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Welcome');
    });
  });

  describe('Vets Route', () => {
    it('should GET /vets.html and list veterinarians', async () => {
      const res = await request(app).get('/vets.html');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('James Carter');
    });

    it('should GET /vets and return JSON', async () => {
      const res = await request(app).get('/vets');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.body.vetList[0].firstName).toBe('James');
    });
  });

  describe('Owners Route', () => {
    it('should show the find owners form', async () => {
      const res = await request(app).get('/owners/find');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Find Owners');
    });

    it('should redirect to details when exactly one owner is found', async () => {
      const res = await request(app).get('/owners?lastName=Franklin');
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toMatch(/\/owners\/\d+/);
    });

    it('should show error when owner not found', async () => {
      const res = await request(app).get('/owners?lastName=Unknown');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('has not been found');
    });

    it('should create a new owner and redirect', async () => {
      const res = await request(app)
        .post('/owners/new')
        .send({
          firstName: 'New',
          lastName: 'User',
          address: '789 Road',
          city: 'Chicago',
          telephone: '1112223333'
        });
      expect(res.statusCode).toBe(302);
      
      const created = await Owner.findOne({ where: { lastName: 'User' } });
      expect(created).not.toBeNull();
    });

    it('should fail validation for invalid owner data', async () => {
      const res = await request(app)
        .post('/owners/new')
        .send({ firstName: 'ShortPhone', telephone: '123' });
      expect(res.statusCode).toBe(200);
      // Stays on page to show errors
      expect(res.text).toContain('Add Owner');
    });
  });

  describe('Pet and Visit Routes', () => {
    let ownerId;
    beforeAll(async () => {
      const owner = await Owner.findOne();
      ownerId = owner.id;
    });

    it('should show the add pet form', async () => {
      const res = await request(app).get(`/owners/${ownerId}/pets/new`);
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('cat');
    });

    it('should create a pet for an owner', async () => {
      const type = await PetType.findOne();
      const res = await request(app)
        .post(`/owners/${ownerId}/pets/new`)
        .send({ name: 'Jasper', birthDate: '2022-01-01', typeId: type.id });
      
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe(`/owners/${ownerId}`);
    });

    it('should create a visit for a pet', async () => {
      const owner = await Owner.findByPk(ownerId, { include: ['pets'] });
      const petId = owner.pets[0].id;
      
      const res = await request(app)
        .post(`/owners/${ownerId}/pets/${petId}/visits/new`)
        .send({ date: '2023-11-11', description: 'Vaccination' });
      
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe(`/owners/${ownerId}`);
    });
  });

  describe('Error Handling', () => {
    it('should handle thrown errors via the crash controller simulation', async () => {
      const res = await request(app).get('/oups');
      expect(res.statusCode).toBe(500);
      expect(res.text).toContain('Expected: controller used to showcase');
    });
  });
});
