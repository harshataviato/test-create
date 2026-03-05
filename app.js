/**
 * Main Application Entry Point
 * Configures Express, Middleware, and Routes
 */
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const methodOverride = require('method-override');
const { sequelize } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 8080;

// Configure Internationalization (i18n)
i18n.configure({
  locales: ['en', 'es', 'de', 'ru', 'tr', 'ko', 'pt'],
  directory: path.join(__dirname, 'src/locales'),
  defaultLocale: 'en',
  queryParameter: 'lang',
  cookie: 'lang',
  objectNotation: true
});

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method')); // Support for PUT/DELETE via hidden form fields
app.use(express.static(path.join(__dirname, 'public')));
app.use(i18n.init);

// Global Template Variables
app.use((req, res, next) => {
  res.locals.path = req.path;
  res.locals.query = req.query;
  // Mimic Spring's #temporals or #strings helpers for templates
  res.locals.helpers = {
    formatDate: (date) => date ? new Date(date).toISOString().split('T')[0] : ''
  };
  next();
});

// Import Routes
const ownerRoutes = require('./src/routes/ownerRoutes');
const vetRoutes = require('./src/routes/vetRoutes');
const systemRoutes = require('./src/routes/systemRoutes');

app.use('/', systemRoutes);
app.use('/owners', ownerRoutes);
app.use('/vets', vetRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    status: 500, 
    message: err.message,
    menu: 'error'
  });
});

// Initialize DB and Start Server
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`PetClinic Server running at http://localhost:${PORT}`);
  });
});
