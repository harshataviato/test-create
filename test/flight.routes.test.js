const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('../models');
const flightRoutes = require('../routes/flight.routes');

describe('Flight Routes & Controller Integration Tests', () => {
    let app;

    before(async () => {
        // Setup Express app specifically for testing
        app = express();
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, '../views'));
        app.use('/', flightRoutes);

        // Sync database (using :memory: via environment variable in package.json)
        await db.sequelize.sync({ force: true });
    });

    beforeEach(async () => {
        // Clear data between tests to ensure isolation
        await db.Flight.destroy({ where: {}, truncate: true });
    });

    describe('GET / (Dashboard)', () => {
        it('should render the index page with flights', async () => {
            await db.Flight.create({
                flightNumber: 'AV001',
                origin: 'London',
                destination: 'Paris',
                departureTime: new Date(),
                status: 'On Time'
            });

            const res = await request(app).get('/');
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('Aviato Flight Management');
            expect(res.text).to.contain('AV001');
            expect(res.text).to.contain('London');
        });

        it('should show "No flights found" when DB is empty', async () => {
            const res = await request(app).get('/');
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('No flights found.');
        });
    });

    describe('GET /add', () => {
        it('should render the add-flight form', async () => {
            const res = await request(app).get('/add');
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('Register New Flight');
        });
    });

    describe('POST /add', () => {
        it('should create a new flight and redirect to home', async () => {
            const res = await request(app)
                .post('/add')
                .send({
                    flightNumber: 'AV101',
                    origin: 'San Francisco',
                    destination: 'New York',
                    departureTime: '2023-12-25T10:00',
                    status: 'On Time'
                });
            
            expect(res.status).to.equal(302);
            expect(res.header.location).to.equal('/');

            const flight = await db.Flight.findOne({ where: { flightNumber: 'AV101' } });
            expect(flight).to.not.be.null;
            expect(flight.origin).to.equal('San Francisco');
        });

        it('should return 400 if origin and destination are the same', async () => {
            const res = await request(app)
                .post('/add')
                .send({
                    flightNumber: 'ERR01',
                    origin: 'San Francisco',
                    destination: 'San Francisco',
                    departureTime: '2023-12-25T10:00',
                    status: 'On Time'
                });
            
            expect(res.status).to.equal(400);
            expect(res.text).to.equal('Origin and Destination cannot be the same.');
        });

        it('should return 500 if flightNumber is duplicate', async () => {
            await db.Flight.create({
                flightNumber: 'DUP01',
                origin: 'SFO',
                destination: 'LAX',
                departureTime: new Date()
            });

            const res = await request(app)
                .post('/add')
                .send({
                    flightNumber: 'DUP01',
                    origin: 'JFK',
                    destination: 'ORD',
                    departureTime: new Date()
                });
            
            expect(res.status).to.equal(500);
            expect(res.body.message).to.exist;
        });
    });

    describe('GET /delete/:id', () => {
        it('should delete a flight and redirect', async () => {
            const flight = await db.Flight.create({
                flightNumber: 'DEL99',
                origin: 'Berlin',
                destination: 'Munich',
                departureTime: new Date()
            });

            const res = await request(app).get(`/delete/${flight.id}`);
            expect(res.status).to.equal(302);
            
            const checkFlight = await db.Flight.findByPk(flight.id);
            expect(checkFlight).to.be.null;
        });
    });
});
