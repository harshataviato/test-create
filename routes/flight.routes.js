/**
 * Maps HTTP verbs and URLs to Controller functions.
 */
const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flight.controller');

// GET: Display all flights
router.get('/', flightController.getAllFlights);

// GET: Show form to add flight
router.get('/add', flightController.renderCreateForm);

// POST: Process flight creation
router.post('/add', flightController.createFlight);

// POST/GET: Delete flight (using GET for simplicity in a basic UI link)
router.get('/delete/:id', flightController.deleteFlight);

module.exports = router;
