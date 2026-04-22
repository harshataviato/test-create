const express = require('express');
const path = require('path');
const i18n = require('i18n');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const { sequelize } = require('./models');

const app = express();

/**
 * Internationalization Configuration
 */
i18n.configure({
  locales: ['en', 'de', 'es', 'fa', 'ko', 'pt', 'ru', 'tr'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  queryParameter: 'lang',
  register: global
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // Supports PUT/DELETE via forms
app.use(i18n.init);

// View Engine setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Static assets
app.use('/resources', express.static(path.join(__dirname, 'public')));

/**
 * Routes setup
 */
app.use('/', require('./routes/welcome'));
app.use('/owners', require('./routes/owner'));
app.use('/vets', require('./routes/vet'));
app.get('/vets.html', (req, res) => res.redirect('/vets'));

// Error handling - Crash Controller logic
app.get('/oups', (req, res) => {
  throw new Error('Expected: controller used to showcase what happens when an exception is thrown');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { status: 404, message: 'Not Found' });
});

// General Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    status: 500, 
    message: err.message || 'Internal Server Error' 
  });
});

const PORT = process.env.PORT || 8080;

// Sync database and start server
sequelize.sync().then(() => {
  console.log('Database synced successfully.');
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
