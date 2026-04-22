const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const sequelize = require('../config/database');
const startupRoutes = require('../routes/startupRoutes');
const Startup = require('../models/Startup');

// Setup a test app instance
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use('/', startupRoutes);

describe('Startup Routes Integration Tests', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Startup.destroy({ where: {}, truncate: true });
  });

  describe('GET /', () => {
    it('should render the dashboard with a 200 status', async () => {
      await Startup.create({ name: 'Aviato', industry: 'Cloud', valuation: 1000000 });
      
      const res = await request(app).get('/');
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Aviato');
      expect(res.text).to.contain('Cloud');
    });
  });

  describe('GET /new', () => {
    it('should render the creation form', async () => {
      const res = await request(app).get('/new');
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Register New Startup');
    });
  });

  describe('POST /startups', () => {
    it('should create a new startup and redirect to dashboard', async () => {
      const res = await request(app)
        .post('/startups')
        .send('name=Bachmanity&industry=VC&valuation=250000&status=Seed');

      expect(res.status).to.equal(302);
      expect(res.header.location).to.equal('/');

      const startup = await Startup.findOne({ where: { name: 'Bachmanity' } });
      expect(startup).to.not.be.null;
      expect(startup.industry).to.equal('VC');
    });

    it('should return 400 if validation fails', async () => {
      // Sending empty name
      const res = await request(app)
        .post('/startups')
        .send('name=&industry=Tech');

      expect(res.status).to.equal(400);
      expect(res.text).to.contain('Validation Error');
    });
  });

  describe('POST /startups/delete/:id', () => {
    it('should delete an existing startup and redirect', async () => {
      const startup = await Startup.create({ 
        name: 'Endframes', 
        industry: 'Video', 
        valuation: 100 
      });

      const res = await request(app).post(`/startups/delete/${startup.id}`);
      
      expect(res.status).to.equal(302);
      expect(res.header.location).to.equal('/');

      const deletedStartup = await Startup.findByPk(startup.id);
      expect(deletedStartup).to.be.null;
    });

    it('should handle deletion of non-existent ID gracefully', async () => {
      // Should still redirect or handle normally as DB destroy returns 0 rows
      const res = await request(app).post('/startups/delete/9999');
      expect(res.status).to.equal(302);
    });
  });
});
