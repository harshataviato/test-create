/**
 * Application Entry Point
 * 
 * Sets up Express, middleware, view engine, and database connection.
 * Starts the server.
 */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const i18n = require('./config/i18n');
const sequelize = require('./config/database');
const routes = require('./routes');
const seedData = require('./utils/seeder');

const app = express();
const PORT = process.env.PORT || 8080;

// Setup View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(i18n.init); // Internationalization

// Make moments available in views for date formatting
app.locals.moment = require('moment'); 

// Routes
app.use('/', routes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).render('error', { message: 'Page Not Found', status: 404 });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    message: err.message || 'Something happened...', 
    status: 500 
  });
});

// Database Sync and Server Start
sequelize.sync()
  .then(async () => {
    await seedData(); // Load initial data if empty
    app.listen(PORT, () => {
      console.log(`PetClinic is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
