/**
 * Test App Factory
 * Recreates the Express App configuration from server.js without listening on a port.
 * This allows Supertest to wrap the app instance.
 */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
const routes = require('../../routes/index');

const createApp = () => {
    const app = express();
    
    // Config
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../../views'));

    // Middleware
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(methodOverride('_method'));
    app.use(express.static(path.join(__dirname, '../../public')));

    // Routes
    app.use('/', routes);

    // Error Handling (Simulated from server.js)
    app.use((err, req, res, next) => {
        // console.error(err.stack); // Silence logs during test
        res.status(500).render('error', { error: err });
    });

    app.use((req, res, next) => {
        res.status(404).render('error', { error: { message: "The requested page was not found." } });
    });

    return app;
};

module.exports = createApp;
