/**
 * Main Application Entry Point
 * 
 * Sets up Express server, database connection, view engine, and aggregates routes.
 * Equivalent to PetClinicApplication.java
 */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { sequelize } = require('./models');

// Controllers
const welcomeController = require('./controllers/welcomeController');
const ownerController = require('./controllers/ownerController');
const petController = require('./controllers/petController');
const visitController = require('./controllers/visitController');
const vetController = require('./controllers/vetController');
const crashController = require('./controllers/crashController');

const app = express();
const port = process.env.PORT || 8080;

// View Engine Setup (EJS replaces Thymeleaf)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static assets (CSS, images)

// Make moment available in all views for date formatting
app.locals.moment = require('moment');

// --- Routes ---

// System / Welcome
app.get('/', welcomeController.welcome);
app.get('/oups', crashController.triggerException);

// Owners
app.get('/owners/find', ownerController.initFindForm);
app.get('/owners', ownerController.processFindForm);
app.get('/owners/new', ownerController.initCreationForm);
app.post('/owners/new', ownerController.processCreationForm);
app.get('/owners/:ownerId', ownerController.showOwner);
app.get('/owners/:ownerId/edit', ownerController.initUpdateOwnerForm);
app.post('/owners/:ownerId/edit', ownerController.processUpdateOwnerForm);

// Pets
app.get('/owners/:ownerId/pets/new', petController.initCreationForm);
app.post('/owners/:ownerId/pets/new', petController.processCreationForm);
app.get('/owners/:ownerId/pets/:petId/edit', petController.initUpdateForm);
app.post('/owners/:ownerId/pets/:petId/edit', petController.processUpdateForm);

// Visits
app.get('/owners/:ownerId/pets/:petId/visits/new', visitController.initNewVisitForm);
app.post('/owners/:ownerId/pets/:petId/visits/new', visitController.processNewVisitForm);

// Vets
app.get('/vets.html', vetController.showVetList);
app.get('/vets', vetController.showResourcesVetList);

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
    message: "The requested page was not found.",
    status: 404
  });
});

// Start Server and Sync Database
sequelize.sync().then(() => {
  console.log('Database synchronized');
  app.listen(port, () => {
    console.log(`PetClinic application running on http://localhost:${port}`);
  });
});
