const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const routes = require('./routes');
const db = require('./models');

const app = express();

// View Engine (EJS setup to mimic Thymeleaf)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method')); // Supports PUT/DELETE from forms
app.use(express.static(path.join(__dirname, 'public')));

// Global Template variables (i18n placeholders for simple porting)
app.use((req, res, next) => {
  res.locals.title = "PetClinic :: a Spring Framework demonstration";
  next();
});

// Routing
app.use('/', routes);

// Centralized Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    status: 500, 
    message: err.message || "Something happened..." 
  });
});

// Port configuration
const PORT = process.env.PORT || 8080;

/**
 * Startup Sequence:
 * 1. Sync Database Schema
 * 2. Seed Initial Data
 * 3. Start Listener
 */
db.sequelize.sync({ force: false }).then(async () => {
  await db.seed();
  app.listen(PORT, () => {
    console.log(`PetClinic running at http://localhost:${PORT}`);
  });
});
