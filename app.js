/**
 * Main Application Entry Point
 * Configures Express, Middleware, and Routes
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const { sequelize } = require('./models');

const app = express();

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'fragments/layout');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Allows using PUT/DELETE in HTML forms
app.use(methodOverride('_method'));

// Import Routes
const welcomeRouter = require('./routes/welcome');
const ownerRouter = require('./routes/owners');
const vetRouter = require('./routes/vets');
const visitRouter = require('./routes/visits');

// Global Locals for Templates (mirrors Spring messages)
app.use((req, res, next) => {
  res.locals.path = req.path;
  // Simple mock of I18n properties
  res.locals.messages = require('./locales/messages_en.json');
  next();
});

// Route Bindings
app.use('/', welcomeRouter);
app.use('/owners', ownerRouter);
app.use('/vets', vetRouter);
app.use('/owners', visitRouter); // Visits are nested under owners/pets

// Error Handling (Crash Controller simulation)
app.get('/oups', (req, res) => {
  throw new Error("Expected: controller used to showcase what happens when an exception is thrown");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    status: 500, 
    message: err.message,
    menu: 'error'
  });
});

// Database Sync and Start
const PORT = process.env.PORT || 8080;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`PetClinic running on port ${PORT}`);
  });
});
