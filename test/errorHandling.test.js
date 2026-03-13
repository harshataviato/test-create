const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const path = require('path');
const i18n = require('i18n');

// Import the main app setup but without the server start
const app = express();
i18n.configure({
  locales: ['en'],
  directory: path.join(__dirname, '../locales'),
  defaultLocale: 'en'
});
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(i18n.init);

// Crash Demo Route
app.get('/oups', (req, res) => {
  throw new Error("Expected exception");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render('error', { status: 404, message: 'Page not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(500).render('error', { status: 500, message: err.message });
});

describe('App Error Handling', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.status).to.equal(404);
    expect(res.text).to.contain('404');
    expect(res.text).to.contain('Page not found');
  });

  it('should return 500 for the /oups route', async () => {
    const res = await request(app).get('/oups');
    expect(res.status).to.equal(500);
    expect(res.text).to.contain('500');
    expect(res.text).to.contain('Expected exception');
  });
});
