const { expect } = require('chai');
const { Sequelize, DataTypes } = require('sequelize');
const FlightModel = require('../models/flight.model');

describe('Flight Model Unit Tests', () => {
    let sequelize;
    let Flight;

    before(async () => {
        // Initialize an in-memory database for isolated model testing
        sequelize = new Sequelize('sqlite::memory:', { logging: false });
        Flight = FlightModel(sequelize, DataTypes);
        await sequelize.sync({ force: true });
    });

    after(async () => {
        await sequelize.close();
    });

    it('should create a flight with valid attributes', async () => {
        const flightData = {
            flightNumber: 'UA123',
            origin: 'SFO',
            destination: 'JFK',
            departureTime: new Date(),
            status: 'On Time'
        };
        const flight = await Flight.create(flightData);
        expect(flight.flightNumber).to.equal('UA123');
        expect(flight.status).to.equal('On Time');
    });

    it('should fail if flightNumber is missing', async () => {
        try {
            await Flight.create({
                origin: 'SFO',
                destination: 'LAX',
                departureTime: new Date()
            });
            throw new Error('Test should have failed');
        } catch (err) {
            expect(err.name).to.equal('SequelizeValidationError');
        }
    });

    it('should enforce unique constraint on flightNumber', async () => {
        const flightData = {
            flightNumber: 'DUP456',
            origin: 'SFO',
            destination: 'ORD',
            departureTime: new Date()
        };
        await Flight.create(flightData);
        try {
            await Flight.create(flightData);
            throw new Error('Test should have failed due to unique constraint');
        } catch (err) {
            expect(err.name).to.equal('SequelizeUniqueConstraintError');
        }
    });

    it('should apply default status "On Time"', async () => {
        const flight = await Flight.create({
            flightNumber: 'DEF789',
            origin: 'SFO',
            destination: 'SEA',
            departureTime: new Date()
        });
        expect(flight.status).to.equal('On Time');
    });

    it('should fail if status is not within ENUM values', async () => {
        try {
            await Flight.create({
                flightNumber: 'ENUM1',
                origin: 'SFO',
                destination: 'SEA',
                departureTime: new Date(),
                status: 'Flying' // Invalid enum value
            });
            throw new Error('Test should have failed');
        } catch (err) {
            expect(err.name).to.equal('SequelizeDatabaseError');
        }
    });
});
