/**
 * Main Application Entry Point
 * 
 * Configures Express, Database connection, Middleware, and Routes.
 * Mimics SpringBootApplication entry point.
 */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override'); // Allows PUT/DELETE in HTML forms
const session = require('express-session');
const flash = require('connect-flash');
const db = require('./config/database');
const dataLoader = require('./utils/dataLoader');

// Route Imports
const indexRoutes = require('./routes/index');
const ownerRoutes = require('./routes/owner');
const vetRoutes = require('./routes/vet');
const petRoutes = require('./routes/pet');
const visitRoutes = require('./routes/visit');
const crashRoutes = require('./routes/crash');

const app = express();
const PORT = process.env.PORT || 8080;

// View Engine Setup (EJS replaces Thymeleaf)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Resources (CSS, Images, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/webjars', express.static(path.join(__dirname, 'node_modules'))); // Bootstrap mapping

// Middleware Configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method')); // Support for PUT/DELETE via _method query param

// Session Configuration (Required for Flash messages)
app.use(session({
    secret: 'petclinic-secret',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// Global Variables Middleware (Available in all views)
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.currentPath = req.path; // For Active Menu Highlighting
    next();
});

// Route Registration
app.use('/', indexRoutes);
app.use('/owners', ownerRoutes);
app.use('/vets', vetRoutes); // Handles both HTML and JSON
// Pet and Visit routes are nested within owners in Spring, we mirror that logic in the router
app.use('/owners/:ownerId/pets', petRoutes); 
app.use('/owners/:ownerId/pets/:petId/visits', visitRoutes);
app.use('/oups', crashRoutes);

// Error Handling (404 & 500)
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
        message: err.message || 'An unexpected error occurred.' 
    });
});

// Database Sync and Server Start
// force: false ensures we don't drop tables on restart unless specified
db.sequelize.sync({ force: true }).then(async () => {
    console.log('Database connected and synchronized.');
    // Load initial data (mimics data.sql)
    await dataLoader.loadData(); 
    app.listen(PORT, () => {
        console.log(`Spring PetClinic (Node Version) running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Database connection failed:', err);
});
