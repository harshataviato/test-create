/**
 * Controller handling all business logic for Flights.
 * Bridges the gap between Routes and Models.
 */
const db = require('../models');
const Flight = db.Flight;

/**
 * List all flights and render the dashboard.
 */
exports.getAllFlights = async (req, res) => {
    try {
        const flights = await Flight.findAll({ order: [['departureTime', 'ASC']] });
        res.render('index', { flights });
    } catch (error) {
        res.status(500).send({ message: error.message || "Error occurred retrieving flights." });
    }
};

/**
 * Render the page to create a new flight.
 */
exports.renderCreateForm = (req, res) => {
    res.render('add-flight');
};

/**
 * Handle POST request to create a new flight.
 */
exports.createFlight = async (req, res) => {
    try {
        const { flightNumber, origin, destination, departureTime, status } = req.body;
        
        // Business logic check: Ensure origin and destination are different
        if (origin === destination) {
            return res.status(400).send("Origin and Destination cannot be the same.");
        }

        await Flight.create({
            flightNumber,
            origin,
            destination,
            departureTime,
            status
        });

        res.redirect('/');
    } catch (error) {
        res.status(500).send({ message: error.message || "Error occurred creating flight." });
    }
};

/**
 * Delete a flight by ID.
 */
exports.deleteFlight = async (req, res) => {
    try {
        const id = req.params.id;
        await Flight.destroy({ where: { id: id } });
        res.redirect('/');
    } catch (error) {
        res.status(500).send({ message: "Could not delete flight with id=" + id });
    }
};
