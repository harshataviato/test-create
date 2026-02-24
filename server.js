/**
 * Entry point for the Node PetClinic application.
 * Configures Express, Database connection, Middleware, and Routes.
 */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const morgan = require('morgan');
const sequelize = require('./config/database');

// Import Routers
const indexRoutes = require('./routes/index');
const ownerRoutes = require('./routes/owner');
const vetRoutes = require('./routes/vet');
const petRoutes = require('./routes/pet');
const visitRoutes = require('./routes/visit');
const crashRoutes = require('./routes/crash');

const app = express();
const PORT = process.env.PORT || 8080;

// Database Synchronization
// In production, use migrations. For this demo, we sync.
sequelize.sync().then(() => {
    console.log('Database synced');
}).catch(err => console.error('Database sync error:', err));

// View Engine Setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'fragments/layout');

// Middleware
app.use(morgan('dev')); // Logging
app.use(express.static(path.join(__dirname, 'public'))); // Static files
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data
app.use(bodyParser.json());
app.use(methodOverride('_method')); // Support PUT/DELETE in forms

// Global Helpers for Views
app.locals.formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
};

// Routes
app.use('/', indexRoutes);
app.use('/owners', ownerRoutes);
app.use('/vets', vetRoutes);
app.use('/', petRoutes); // Pet routes are nested in owners usually
app.use('/', visitRoutes);
app.use('/', crashRoutes);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).render('error', {
        status: 404,
        message: 'The requested page was not found.',
        menu: 'error'
    });
});

// General Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        status: 500,
        message: err.message || 'An unexpected error occurred.',
        menu: 'error'
    });
});

app.listen(PORT, () => {
    console.log(`PetClinic running on http://localhost:${PORT}`);
});
