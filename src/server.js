/**
 * Main Application Entry Point.
 * 
 * Sets up Express, Middleware, Database Sync, and Routes.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

// Local imports
const i18n = require('./config/i18n');
const sequelize = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, '../public'))); // for css/js assets
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(i18n.init); // Initialize I18n

// Database Sync
sequelize.sync().then(() => {
  console.log('[Database] Connected and Synced');
}).catch(err => {
  console.error('[Database] Connection Failed:', err);
});

// Routes
app.use('/', routes);

// Global Error Handler (Must be last)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
