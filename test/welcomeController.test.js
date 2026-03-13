const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const welcomeController = require('../controllers/welcomeController');

const app = express();
i18n.configure({ locales: ['en'], directory: path.join(__dirname, '../locales') });
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(i18n.init);
app.get('/', welcomeController.index);

describe('Welcome Controller', () => {
  it('should render the welcome page', async () => {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Welcome');
  });
});
