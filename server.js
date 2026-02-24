/**
 * Main Entry Point
 * Configures Express, Database, Middleware, and Routes.
 */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const seeder = require('./src/utils/seeder');

const app = express();
const PORT = process.env.PORT || 8080;

// View Engine Setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Middleware
// Parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Allow overriding methods (e.g. PUT/DELETE in forms)
app.use(methodOverride('_method'));

// Static files (CSS, Images)
app.use(express.static(path.join(__dirname, 'src/public')));

// Helpers available in all views
app.locals.moment = require('moment'); // For date formatting

// Routes
app.use('/', routes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    message: err.message,
    status: 500
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).render('error', {
    message: 'The requested page was not found.',
    status: 404
  });
});

// Database Sync and Server Start
// force: true will drop tables on restart (mimicking H2 in-memory behavior)
sequelize.sync({ force: true }).then(async () => {
  console.log('Database synced.');
  
  // Seed data similar to data.sql
  await seeder();
  
  app.listen(PORT, () => {
    console.log(`PetClinic running on http://localhost:${PORT}`);
  });
});
