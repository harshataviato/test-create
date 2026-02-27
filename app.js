const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const webRoutes = require('./routes/web');
const sequelize = require('./config/db');

const app = express();
const PORT = process.env.PORT || 8080;

/**
 * Senior Engineer Note: We're using standard Middleware. 
 * BodyParser for form handling, static for assets, 
 * and EJS for view rendering.
 */

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Layout support (Simple implementation of Thymeleaf fragments)
app.use((req, res, next) => {
    const render = res.render;
    res.render = function(view, options, fn) {
        render.call(this, view, options, (err, html) => {
            if (err) return fn ? fn(err) : next(err);
            render.call(this, 'fragments/layout', { ...options, body: html }, fn);
        });
    };
    next();
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', webRoutes);

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: err.message });
});

// Start Server
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`PetClinic running at http://localhost:${PORT}`);
    });
});
