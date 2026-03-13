/**
 * PetClinic Node.js Application Entry Point
 * Senior Engineer Note: This setup uses Express for the web server, 
 * Sequelize for ORM, and EJS for server-side rendering.
 */

const express = require('express');
const path = require('path');
const i18n = require('i18n');
const methodOverride = require('method-override');
const { sequelize } = require('./models');
const seedDatabase = require('./db/seed');

const app = express();

// Configuration for Internationalization (i18n)
i18n.configure({
  locales: ['en', 'de', 'es', 'fa', 'ko', 'pt', 'ru', 'tr'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  queryParameter: 'lang',
  cookie: 'lang',
  objectNotation: true
});

// View Engine Setup (EJS replaces Thymeleaf)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(i18n.init);

// Global view variables (mimicking Spring model attributes)
app.use((req, res, next) => {
  res.locals.url = req.url;
  next();
});

// Import Controllers (Routes)
const welcomeController = require('./controllers/welcomeController');
const ownerController = require('./controllers/ownerController');
const petController = require('./controllers/petController');
const visitController = require('./controllers/visitController');
const vetController = require('./controllers/vetController');

// Route Mappings
app.get('/', welcomeController.index);
app.use('/owners', ownerController);
app.use('/owners/:ownerId/pets', petController);
app.use('/owners/:ownerId/pets/:petId/visits', visitController);
app.get('/vets.html', vetController.listHtml);
app.get('/vets', vetController.listJson);

// Crash Demo Route (Mimics CrashController.java)
app.get('/oups', (req, res) => {
  throw new Error("Expected: controller used to showcase what happens when an exception is thrown");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render('error', { status: 404, message: 'Page not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { status: 500, message: err.message });
});

// Database Sync and Server Start
const PORT = process.env.PORT || 8080;
sequelize.sync({ force: true }).then(async () => {
  console.log('Database synced.');
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`PetClinic running at http://localhost:${PORT}`);
  });
});
