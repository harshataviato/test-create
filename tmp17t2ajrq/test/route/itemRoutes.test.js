process.env.NODE_ENV = 'test'; // Ensure test environment

const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app'); // Import app from app.js
const { Item, db } = require('../../app'); // Also import db for direct database interaction

describe('Item Routes', () => {
    let server; // To hold the actual HTTP server instance started by app.listen in app.js if not in test env
    let agent;  // supertest agent for persistent requests

    before(async () => {
        // Ensure the server is listening before tests begin.
        // If app.js is structured to start the server conditionally, supertest can handle it.
        // However, since app.js might automatically call app.listen() if not in 'test' env,
        // we're ensuring db is synced and app is ready for supertest.
        await db.sequelize.sync({ force: true }); // Clear db once for all tests in this suite
        // For supertest, passing the app instance is enough; it manages its own server.
        agent = request.agent(app);
    });

    beforeEach(async () => {
        // Clear and re-sync database before each test for isolation
        await db.sequelize.sync({ force: true });
        // Seed some data for 'getAllItems' and 'edit' tests
        await Item.create({ name: 'Laptop', description: 'Powerful computing machine', price: 1200.00 });
        await Item.create({ name: 'Mouse', description: 'Wireless optical mouse', price: 25.50 });
    });

    // We don't need `after` to close a server managed by `supertest(app)`.
    // If `app.listen()` was truly called in app.js and we needed to close it,
    // we would need to capture that server instance. Given the `if (process.env.NODE_ENV !== 'test')`
    // guard in `app.js`, the server is not started automatically when imported here.

    describe('GET /', () => {
        it('should redirect to /items', async () => {
            const res = await agent.get('/');
            expect(res.statusCode).to.equal(302);
            expect(res.headers.location).to.equal('/items');
        });
    });

    describe('GET /items', () => {
        it('should render the items index page with all items', async () => {
            const res = await agent.get('/items');
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include('<h2>Item List</h2>');
            expect(res.text).to.include('Laptop');
            expect(res.text).to.include('Mouse');
            expect(res.text).to.include('$1200.00'); // Check formatted price
            expect(res.text).to.include('$25.50');
        });

        it('should render the items index page correctly when no items exist', async () => {
            await db.sequelize.sync({ force: true }); // Clear all items
            const res = await agent.get('/items');
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include('No items found. Start by adding a new one!');
            expect(res.text).to.not.include('<table>');
        });

        // Test database error during getAllItems (hard to simulate without mocking,
        // so rely on global error handler for unexpected errors)
    });

    describe('GET /items/create', () => {
        it('should render the create item form', async () => {
            const res = await agent.get('/items/create');
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include('<h2>Create New Item</h2>');
            expect(res.text).to.include('<form action="/items" method="POST">');
        });
    });

    describe('POST /items', () => {
        it('should create a new item and redirect to /items on success', async () => {
            const res = await agent.post('/items').send({
                name: 'New Gadget',
                description: 'A cool new gadget',
                price: 50.00
            });
            expect(res.statusCode).to.equal(302);
            expect(res.headers.location).to.equal('/items');

            const createdItem = await Item.findOne({ where: { name: 'New Gadget' } });
            expect(createdItem).to.exist;
            expect(createdItem.price).to.equal(50.00);
        });

        it('should re-render create form with error message if name is missing', async () => {
            const res = await agent.post('/items').send({
                description: 'Missing name item',
                price: 10.00
            });
            expect(res.statusCode).to.equal(400);
            expect(res.text).to.include('All fields are required.');
            expect(res.text).to.include('Create New Item'); // Still on create page
            expect(res.text).to.include('value="10"'); // Price should be repopulated
        });

        it('should re-render create form with error message if price is missing', async () => {
            const res = await agent.post('/items').send({
                name: 'Missing Price Item',
                description: 'Description'
            });
            expect(res.statusCode).to.equal(400);
            expect(res.text).to.include('All fields are required.');
            expect(res.text).to.include('Create New Item');
            expect(res.text).to.include('value="Missing Price Item"'); // Name repopulated
        });

        it('should re-render create form with error message if price is invalid (not a number)', async () => {
            const res = await agent.post('/items').send({
                name: 'Invalid Price Item',
                description: 'Description',
                price: 'abc'
            });
            expect(res.statusCode).to.equal(400);
            expect(res.text).to.include('Price must be a positive number.');
            expect(res.text).to.include('Create New Item');
            expect(res.text).to.include('value="abc"'); // Invalid price repopulated
        });

        it('should re-render create form with error message if price is zero', async () => {
            const res = await agent.post('/items').send({
                name: 'Zero Price Item',
                description: 'Description',
                price: 0
            });
            expect(res.statusCode).to.equal(400);
            expect(res.text).to.include('Price must be a positive number.');
            expect(res.text).to.include('Create New Item');
            expect(res.text).to.include('value="0"');
        });

        it('should re-render create form with error message if price is negative', async () => {
            const res = await agent.post('/items').send({
                name: 'Negative Price Item',
                description: 'Description',
                price: -10.00
            });
            expect(res.statusCode).to.equal(400);
            expect(res.text).to.include('Price must be a positive number.');
            expect(res.text).to.include('Create New Item');
            expect(res.text).to.include('value="-10"');
        });
    });

    describe('GET /items/:id/edit', () => {
        let laptop;
        beforeEach(async () => {
            laptop = await Item.findOne({ where: { name: 'Laptop' } });
        });

        it('should render the edit item form with existing item data', async () => {
            const res = await agent.get(`/items/${laptop.id}/edit`);
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include(`<h2>Edit Item: ${laptop.name}</h2>`);
            expect(res.text).to.include(`action="/items/${laptop.id}?_method=PUT"`);
            expect(res.text).to.include(`value="${laptop.name}"`);
            expect(res.text).to.include(`${laptop.description}`);
            expect(res.text).to.include(`value="${laptop.price}"`);
        });

        it('should redirect to /items if item is not found', async () => {
            const res = await agent.get('/items/999999/edit'); // Non-existent ID
            expect(res.statusCode).to.equal(302);
            expect(res.headers.location).to.equal('/items');
        });
    });

    describe('PUT /items/:id', () => {
        let mouse;
        beforeEach(async () => {
            mouse = await Item.findOne({ where: { name: 'Mouse' } });
        });

        it('should update an item and redirect to /items on success', async () => {
            const res = await agent.put(`/items/${mouse.id}`).send({
                name: 'Gaming Mouse',
                description: 'High-precision gaming mouse',
                price: 75.00
            });
            expect(res.statusCode).to.equal(302);
            expect(res.headers.location).to.equal('/items');

            const updatedMouse = await Item.findByPk(mouse.id);
            expect(updatedMouse.name).to.equal('Gaming Mouse');
            expect(updatedMouse.description).to.equal('High-precision gaming mouse');
            expect(updatedMouse.price).to.equal(75.00);
        });

        it('should re-render edit form with error if item is not found', async () => {
            const res = await agent.put('/items/999999').send({
                name: 'Non Existent',
                description: 'Desc',
                price: 100
            });
            expect(res.statusCode).to.equal(302); // Redirect to /items if not found
            expect(res.headers.location).to.equal('/items');
        });

        it('should re-render edit form with error if name is missing', async () => {
            const res = await agent.put(`/items/${mouse.id}`).send({
                name: '',
                description: 'Updated Description',
                price: 30.00
            });
            expect(res.statusCode).to.equal(400);
            expect(res.text).to.include('All fields are required.');
            expect(res.text).to.include(`Edit Item: ${mouse.name}`); // Still on edit page for original item
            expect(res.text).to.include('value="30"'); // Price should be repopulated
        });

        it('should re-render edit form with error if price is invalid (not a number)', async () => {
            const res = await agent.put(`/items/${mouse.id}`).send({
                name: 'Mouse updated',
                description: 'Updated Description',
                price: 'invalid'
            });
            expect(res.statusCode).to.equal(400);
            expect(res.text).to.include('Price must be a positive number.');
            expect(res.text).to.include(`Edit Item: ${mouse.name}`);
            expect(res.text).to.include('value="invalid"');
        });

        it('should re-render edit form with error if price is zero', async () => {
            const res = await agent.put(`/items/${mouse.id}`).send({
                name: 'Mouse updated',
                description: 'Updated Description',
                price: 0
            });
            expect(res.statusCode).to.equal(400);
            expect(res.text).to.include('Price must be a positive number.');
            expect(res.text).to.include(`Edit Item: ${mouse.name}`);
            expect(res.text).to.include('value="0"');
        });
    });

    describe('DELETE /items/:id', () => {
        let laptop;
        beforeEach(async () => {
            laptop = await Item.findOne({ where: { name: 'Laptop' } });
        });

        it('should delete an item and redirect to /items on success', async () => {
            const res = await agent.delete(`/items/${laptop.id}`);
            expect(res.statusCode).to.equal(302);
            expect(res.headers.location).to.equal('/items');

            const deletedItem = await Item.findByPk(laptop.id);
            expect(deletedItem).to.be.null;
        });

        it('should redirect to /items even if item is not found', async () => {
            const res = await agent.delete('/items/999999'); // Non-existent ID
            expect(res.statusCode).to.equal(302);
            expect(res.headers.location).to.equal('/items');
        });
    });

    describe('Global Error Handling', () => {
        it('should render the error page with status 500 for an unhandled error', async () => {
            // Hit the test-error route which explicitly calls next(error)
            const res = await agent.get('/test-error');
            expect(res.statusCode).to.equal(500);
            expect(res.text).to.include('<h1>Oops! Something went wrong.</h1>');
            expect(res.text).to.include('Something broke!');
            // In test environment, error details should not be shown by default for production config
            expect(res.text).to.not.include('Error Details');
        });
    });
});
