/**
 * Main entry point for the Node PetClinic application.
 * Configures Express, Database connection, Middleware, and Routes.
 */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
const db = require('./models');
const seedDatabase = require('./config/seed');

// Import Controllers
const welcomeController = require('./controllers/welcomeController');
const ownerController = require('./controllers/ownerController');
const petController = require('./controllers/petController');
const visitController = require('./controllers/visitController');
const vetController = require('./controllers/vetController');
const crashController = require('./controllers/crashController');

const app = express();
const PORT = process.env.PORT || 8080;

// Set view engine to EJS (Embedded JavaScript templates)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware Configuration
// ------------------------

// Serve static files (CSS, Images, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Allow method overriding for PUT and DELETE requests from HTML forms
app.use(methodOverride('_method'));

// Database Synchronization and Seeding
// ------------------------------------
// force: true drops tables on startup (mimics H2 in-memory behavior)
db.sequelize.sync({ force: true }).then(async () => {
  console.log('Database synchronized.');
  await seedDatabase(db);
  console.log('Database seeded with initial data.');
});

// Routing Configuration
// ---------------------

// Welcome Page
app.get('/', welcomeController.index);

// Owner Routes
app.get('/owners/find', ownerController.initFindForm);
app.get('/owners', ownerController.processFindForm);
app.get('/owners/new', ownerController.initCreationForm);
app.post('/owners/new', ownerController.processCreationForm);
app.get('/owners/:ownerId', ownerController.showOwner);
app.get('/owners/:ownerId/edit', ownerController.initUpdateOwnerForm);
app.post('/owners/:ownerId/edit', ownerController.processUpdateOwnerForm);

// Pet Routes
app.get('/owners/:ownerId/pets/new', petController.initCreationForm);
app.post('/owners/:ownerId/pets/new', petController.processCreationForm);
app.get('/owners/:ownerId/pets/:petId/edit', petController.initUpdateForm);
app.post('/owners/:ownerId/pets/:petId/edit', petController.processUpdateForm);

// Visit Routes
app.get('/owners/:ownerId/pets/:petId/visits/new', visitController.initNewVisitForm);
app.post('/owners/:ownerId/pets/:petId/visits/new', visitController.processNewVisitForm);

// Vet Routes
app.get('/vets.html', vetController.showVetList);
app.get('/vets', vetController.showResourcesVetList); // JSON endpoint

// Crash Route (Error demonstration)
app.get('/oups', crashController.triggerException);

// Error Handling Middleware
// -------------------------
app.use((req, res, next) => {
  res.status(404).render('error', {
    status: 404,
    message: 'The requested page was not found.'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    status: 500,
    message: err.message || 'An internal server error occurred.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`PetClinic application is running on http://localhost:${PORT}`);
});
