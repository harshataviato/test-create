/**
 * Main application entry point.
 * Sets up Express, Middleware, View Engine, and Database synchronization.
 */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const db = require('./models');
const flightRoutes = require('./routes/flight.routes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files (CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', flightRoutes);

// Database Synchronization and Server Start
// { force: false } ensures data isn't deleted on every restart
db.sequelize.sync({ force: false }).then(() => {
    console.log('Database connected and synced.');
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
