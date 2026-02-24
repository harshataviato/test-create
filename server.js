/**
 * Main Application Entry Point
 * 
 * Configures Express, middleware, view engine, and establishes database connection.
 * Maps routes to controllers.
 */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./models');
const ownerRoutes = require('./routes/ownerRoutes');
const vetRoutes = require('./routes/vetRoutes');
const petRoutes = require('./routes/petRoutes');
const visitRoutes = require('./routes/visitRoutes');
const seedData = require('./scripts/seedData');

const app = express();
const PORT = process.env.PORT || 8080;

// View Engine Setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Global helper for dates in views
app.locals.moment = require('moment');

// Database Synchronization and Seeding
// force: true will drop tables on startup (similar to H2 create-drop)
db.sequelize.sync({ force: true }).then(async () => {
  console.log('Database synced.');
  await seedData(db); // Pre-populate data like the Java data.sql
  console.log('Sample data seeded.');
});

// Routes
app.get('/', (req, res) => {
  res.render('welcome');
});

// Error simulation route (CrashController)
app.get('/oups', (req, res, next) => {
  const err = new Error("Expected: controller used to showcase what happens when an exception is thrown");
  err.status = 500;
  next(err);
});

// Mount Resource Routes
app.use('/owners', ownerRoutes);
app.use('/vets', vetRoutes);
// Pet and Visit routes are nested often, but we handle them cleanly in their files
app.use('/', petRoutes); 
app.use('/', visitRoutes); 

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    status: err.status || 500,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`PetClinic is running on http://localhost:${PORT}`);
});
