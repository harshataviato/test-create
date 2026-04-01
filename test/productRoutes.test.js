/**
 * @file Integration tests for product routes using Supertest.
 * These tests interact with the Express app and the actual database.
 */

const request = require('supertest');
const { expect } = require('chai');
const app = require('../app'); // The Express app instance
const Product = require('../models/product'); // The Mongoose model

describe('Product Routes Integration Tests', () => {
  let productId1, productId2; // To store IDs of seeded products

  // beforeEach to clear the database is handled by test/setup.js
  // Seed some data for tests that require existing products
  beforeEach(async () => {
    await Product.deleteMany({}); // Ensure clean state before each test suite

    const product1 = await Product.create({
      name: 'Laptop',
      description: 'Powerful laptop for coding',
      price: 1200.00,
      quantity: 5
    });
    productId1 = product1._id;

    const product2 = await Product.create({
      name: 'Mouse',
      description: 'Ergonomic wireless mouse',
      price: 25.50,
      quantity: 20
    });
    productId2 = product2._id;
  });

  describe('GET /products', () => {
    it('should display all products', async () => {
      const res = await request(app).get('/products');
      expect(res.status).to.equal(200);
      expect(res.text).to.include('All Products');
      expect(res.text).to.include('Laptop');
      expect(res.text).to.include('Mouse');
      expect(res.text).to.include('1200.00');
      expect(res.text).to.include('25.50');
    });

    it('should display "No products found" if database is empty', async () => {
      await Product.deleteMany({}); // Clear all products
      const res = await request(app).get('/products');
      expect(res.status).to.equal(200);
      expect(res.text).to.include('No products found.');
      expect(res.text).to.not.include('Laptop');
    });
  });

  describe('GET /products/new', () => {
    it('should display the new product form', async () => {
      const res = await request(app).get('/products/new');
      expect(res.status).to.equal(200);
      expect(res.text).to.include('Create New Product');
      expect(res.text).to.include('<form action="/products" method="POST">');
      expect(res.text).to.include('<label for="name">Product Name:</label>');
    });
  });

  describe('POST /products', () => {
    it('should create a new product and redirect to /products', async () => {
      const newProduct = {
        name: 'Keyboard',
        description: 'Mechanical keyboard',
        price: 75.00,
        quantity: 10
      };

      const res = await request(app)
        .post('/products')
        .send(newProduct);

      expect(res.status).to.equal(302); // Redirect status
      expect(res.header.location).to.equal('/products');

      const createdProduct = await Product.findOne({ name: 'Keyboard' });
      expect(createdProduct).to.exist;
      expect(createdProduct.description).to.equal(newProduct.description);
      expect(createdProduct.price).to.equal(newProduct.price);
      expect(createdProduct.quantity).to.equal(newProduct.quantity);
    });

    it('should re-render new form with error message on validation failure', async () => {
      const invalidProduct = {
        name: 'A', // Too short
        price: -10, // Negative price
        quantity: 5
      };

      const res = await request(app)
        .post('/products')
        .send(invalidProduct);

      expect(res.status).to.equal(200); // Renders the form again
      expect(res.text).to.include('Create New Product');
      expect(res.text).to.include('Validation Error:');
      expect(res.text).to.include('Product name must be at least 3 characters long'); // Specific error for name
    });
  });

  describe('GET /products/:id', () => {
    it('should display details of a specific product', async () => {
      const res = await request(app).get(`/products/${productId1}`);
      expect(res.status).to.equal(200);
      expect(res.text).to.include('Product Details: Laptop');
      expect(res.text).to.include('Powerful laptop for coding');
      expect(res.text).to.include('$1200.00');
      expect(res.text).to.include('5');
    });

    it('should return 404 for a non-existent product ID', async () => {
      const res = await request(app).get('/products/60c72b2f9b1e8a001c8e4d99'); // Non-existent but valid format ID
      expect(res.status).to.equal(404);
      expect(res.text).to.include('Product Not Found');
      expect(res.text).to.include('The product you requested does not exist.');
    });

    it('should return 500 for an invalid product ID format', async () => {
      const res = await request(app).get('/products/invalid_id');
      expect(res.status).to.equal(500);
      expect(res.text).to.include('Server Error');
      expect(res.text).to.include('Cast to ObjectId failed');
    });
  });

  describe('GET /products/:id/edit', () => {
    it('should display the edit form for a specific product', async () => {
      const res = await request(app).get(`/products/${productId1}/edit`);
      expect(res.status).to.equal(200);
      expect(res.text).to.include('Edit Laptop');
      expect(res.text).to.include('<form action="/products/' + productId1 + '?_method=PUT" method="POST">');
      expect(res.text).to.include('value="Laptop"');
      expect(res.text).to.include('value="1200"');
    });

    it('should return 404 for editing a non-existent product ID', async () => {
      const res = await request(app).get('/products/60c72b2f9b1e8a001c8e4d99/edit');
      expect(res.status).to.equal(404);
      expect(res.text).to.include('Product Not Found');
      expect(res.text).to.include('The product you are trying to edit does not exist.');
    });

    it('should return 500 for editing with an invalid product ID format', async () => {
      const res = await request(app).get('/products/invalid_id/edit');
      expect(res.status).to.equal(500);
      expect(res.text).to.include('Server Error');
      expect(res.text).to.include('Failed to load edit form');
    });
  });

  describe('PUT /products/:id', () => {
    it('should update a product and redirect to its show page', async () => {
      const updatedData = {
        name: 'Updated Laptop',
        description: 'Even more powerful laptop',
        price: 1300.50,
        quantity: 3
      };

      const res = await request(app)
        .post(`/products/${productId1}?_method=PUT`) // Simulate PUT with method-override
        .send(updatedData);

      expect(res.status).to.equal(302);
      expect(res.header.location).to.equal(`/products/${productId1}`);

      const updatedProduct = await Product.findById(productId1);
      expect(updatedProduct).to.exist;
      expect(updatedProduct.name).to.equal(updatedData.name);
      expect(updatedProduct.price).to.equal(updatedData.price);
    });

    it('should re-render edit form with error message on validation failure', async () => {
      const invalidUpdate = {
        name: '', // Empty name
        price: 100,
        quantity: 1
      };

      const res = await request(app)
        .post(`/products/${productId1}?_method=PUT`)
        .send(invalidUpdate);

      expect(res.status).to.equal(200); // Renders the edit form again
      expect(res.text).to.include('Edit Laptop'); // Still on the edit page for the original product
      expect(res.text).to.include('Validation Error:');
      expect(res.text).to.include('Product name is required');
    });

    it('should return 404 for updating a non-existent product ID', async () => {
      const res = await request(app)
        .post('/products/60c72b2f9b1e8a001c8e4d99?_method=PUT')
        .send({ name: 'Bogus Product', price: 1, quantity: 1 });
      expect(res.status).to.equal(404);
      expect(res.text).to.include('Product Not Found');
      expect(res.text).to.include('The product you are trying to update does not exist.');
    });

    it('should return 500 for updating with an invalid product ID format', async () => {
      const res = await request(app)
        .post('/products/invalid_id?_method=PUT')
        .send({ name: 'Bogus Product', price: 1, quantity: 1 });
      expect(res.status).to.equal(500);
      expect(res.text).to.include('Server Error');
      expect(res.text).to.include('Cast to ObjectId failed');
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product and redirect to /products', async () => {
      const res = await request(app)
        .post(`/products/${productId1}?_method=DELETE`); // Simulate DELETE with method-override

      expect(res.status).to.equal(302);
      expect(res.header.location).to.equal('/products');

      const deletedProduct = await Product.findById(productId1);
      expect(deletedProduct).to.not.exist; // Product should be deleted
    });

    it('should return 404 for deleting a non-existent product ID', async () => {
      const res = await request(app)
        .post('/products/60c72b2f9b1e8a001c8e4d99?_method=DELETE');
      expect(res.status).to.equal(404);
      expect(res.text).to.include('Product Not Found');
      expect(res.text).to.include('The product you are trying to delete does not exist.');
    });

    it('should return 500 for deleting with an invalid product ID format', async () => {
      const res = await request(app)
        .post('/products/invalid_id?_method=DELETE');
      expect(res.status).to.equal(500);
      expect(res.text).to.include('Server Error');
      expect(res.text).to.include('Failed to delete product');
    });
  });
});
