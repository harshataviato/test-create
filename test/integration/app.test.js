const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app'); // Import the Express app instance
const db = require('../../config/db'); // For resetting db if needed
const productService = require('../../services/productService'); // To mock for 500 error test
const sinon = require('sinon');

describe('Application-level Routes and Error Handling Integration Tests', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        db.reset(); // Ensure a clean database state for tests that might interact with controllers
    });

    afterEach(() => {
        sandbox.restore(); // Restore all stubs
    });

    // Test GET / - Root URL redirect
    describe('GET /', () => {
        it('should redirect to /products', async () => {
            const res = await request(app).get('/');
            expect(res.status).to.equal(302); // Redirect status code
            expect(res.header.location).to.equal('/products'); // Verify redirect target
        });
    });

    // Test 404 Not Found Middleware
    describe('404 Not Found Handler', () => {
        it('should return 404 for a non-existent route', async () => {
            const res = await request(app).get('/non-existent-page');
            expect(res.status).to.equal(404);
            expect(res.text).to.include("Sorry, that page doesn't exist!");
        });

        it('should return 404 for a non-existent product ID (handled by controller)', async () => {
            const res = await request(app).get('/products/999');
            expect(res.status).to.equal(404);
            expect(res.text).to.include('Product not found.');
        });
    });

    // Test 500 Global Error Handling Middleware
    describe('500 Global Error Handler', () => {
        it('should return 500 for an internal server error', async () => {
            // To simulate a 500 error, we'll make a controller route throw an uncaught error.
            // We'll target the GET /products route by stubbing its service call to throw.
            // This will be caught by the global error handler.
            sandbox.stub(productService, 'getAllProducts').throws(new Error('Simulated Internal Server Error'));

            const res = await request(app).get('/products');
            expect(res.status).to.equal(500);
            expect(res.text).to.include('Something broke!');
            expect(productService.getAllProducts.calledOnce).to.be.true; // Verify our stub was hit
        });
    });
});
