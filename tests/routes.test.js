const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const methodOverride = require('method-override');
const { sequelize, Owner, PetType, Pet } = require('../src/db/models');

// Reconstruct app for testing to ensure isolation
const app = express();

i18n.configure({
    locales: ['en'],
    directory: path.join(__dirname, '../src/locales'),
    defaultLocale: 'en',
    register: global
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(i18n.init);
app.use((req, res, next) => { res.locals.url = req.url; next(); });

const ownerRoutes = require('../src/routes/ownerRoutes');
const vetRoutes = require('../src/routes/vetRoutes');

app.get('/', (req, res) => res.render('welcome', { menu: 'home' }));
app.use('/owners', ownerRoutes);
app.use('/vets.html', vetRoutes);
app.get('/oups', (req, res) => { throw new Error('Expected Exception'); });
app.use((err, req, res, next) => {
    res.status(500).render('error', { status: 500, message: err.message, menu: 'error' });
});

describe('PetClinic HTTP Routes', () => {
    before(async () => {
        await sequelize.sync({ force: true });
        // Seed some basic data for route testing
        await PetType.create({ name: 'dog' });
    });

    describe('Home Page', () => {
        it('should return 200 OK for the landing page', async () => {
            const res = await request(app).get('/');
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('Welcome');
        });
    });

    describe('Owner Routes', () => {
        it('should display the find owners form', async () => {
            const res = await request(app).get('/owners/find');
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('Find Owners');
        });

        it('should show error if owner is not found', async () => {
            const res = await request(app).get('/owners?lastName=NonExistent');
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('has not been found');
        });

        it('should create a new owner and redirect', async () => {
            const res = await request(app)
                .post('/owners/new')
                .send({
                    firstName: 'Franklin',
                    lastName: 'Graham',
                    address: '100 Main St',
                    city: 'New York',
                    telephone: '1234567890'
                });
            expect(res.status).to.equal(302);
            expect(res.header.location).to.match(/\/owners\/\d+/);
        });

        it('should fail owner creation on invalid telephone', async () => {
            const res = await request(app)
                .post('/owners/new')
                .send({
                    firstName: 'Short',
                    lastName: 'Phone',
                    address: '123 St',
                    city: 'City',
                    telephone: '123' // Invalid: too short
                });
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('form-control'); // Re-renders form
        });

        it('should search and redirect if exactly one owner matches', async () => {
            // Already created 'Graham' in previous test
            const res = await request(app).get('/owners?lastName=Graham');
            expect(res.status).to.equal(302);
        });

        it('should show details of a specific owner', async () => {
            const res = await request(app).get('/owners/1');
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('Owner Information');
            expect(res.text).to.contain('Franklin Graham');
        });
    });

    describe('Pet & Visit Routes', () => {
        it('should show the add pet form', async () => {
            const res = await request(app).get('/owners/1/pets/new');
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('New Pet');
        });

        it('should add a pet to an owner', async () => {
            const res = await request(app)
                .post('/owners/1/pets/new')
                .send({ name: 'Rosy', birthDate: '2020-01-01', type: 1 });
            expect(res.status).to.equal(302);
            
            const ownerPage = await request(app).get('/owners/1');
            expect(ownerPage.text).to.contain('Rosy');
        });

        it('should add a visit for a pet', async () => {
            const res = await request(app)
                .post('/owners/1/pets/1/visits/new')
                .send({ date: '2023-10-10', description: 'Checkup' });
            expect(res.status).to.equal(302);
        });
    });

    describe('Vet Routes', () => {
        it('should list veterinarians', async () => {
            const res = await request(app).get('/vets.html');
            expect(res.status).to.equal(200);
            expect(res.text).to.contain('Veterinarians');
        });
    });

    describe('Error Handling', () => {
        it('should render the custom error page for /oups', async () => {
            const res = await request(app).get('/oups');
            expect(res.status).to.equal(500);
            expect(res.text).to.contain('Something happened');
        });
    });
});
