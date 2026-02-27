const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const webRoutes = require('../routes/web');
const sequelize = require('../config/db');

// Setup a clean express app for testing
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

describe('System and Error Routes', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  it('GET / should render welcome page', async () => {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Welcome');
  });

  it('GET /oups should trigger error handler', async () => {
    const res = await request(app).get('/oups');
    // Note: Since we didn't attach the final error handler from app.js 
    // to this test app instance, it will show standard express error.
    // However, the route itself correctly throws the error.
    expect(res.status).to.equal(500);
  });
});
