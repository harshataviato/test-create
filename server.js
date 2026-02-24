/**
 * Main application entry point.
 * Configures Express, Handlebars, Database connection, and Routes.
 */
const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./models');
const routes = require('./routes');
const helpers = require('./utils/handlebars-helpers');
const initialData = require('./seeders/initialData');

const app = express();
const PORT = process.env.PORT || 8080;

// Setup Handlebars view engine
app.engine('.hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: helpers,
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
}));
app.set('view engine', '.hbs');
app.set('views', './views');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', routes);

// Global Error Handler (CrashController equivalent)
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

// Database Synchronization and Server Start
// Using { force: false } to keep data, set true to reset db on restart
db.sequelize.sync({ force: false }).then(async () => {
  console.log('Database synced');
  
  // Check if seeding is needed (simplistic check)
  const ownerCount = await db.Owner.count();
  if (ownerCount === 0) {
    console.log('Seeding database...');
    await initialData(db);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});
