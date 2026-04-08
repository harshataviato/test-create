const request = require('supertest');
const { app, initializeDatabase } = require('../app');
const { sequelize, seedDatabase, syncDatabase } = require('../config/database');
const { DataTypes } = require('sequelize');
const Product = require('../models/product')(sequelize, DataTypes);
const cheerio = require('cheerio');

describe('Product Controller & Routes', () => {
  let server;

  // Before all tests, initialize the database and sync models
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'sqlite::memory:';
    await initializeDatabase(); // Use the app's database initialization
    server = app.listen(0); // Start the app on a random free port for supertest
  });

  // Before each test, clear and re-seed the database
  beforeEach(async () => {
    await Product.destroy({ truncate: true, restartIdentity: true });
    await seedDatabase(); // Seed with default data for consistency
  });

  // After all tests, close the server and database connection
  afterAll(async () => {
    await server.close();
    await sequelize.close();
  });

  // Helper to parse HTML for specific content
  const parseHtml = (html, selector) => {
    const $ = cheerio.load(html);
    return $(selector);
  };

  // --- GET /products (getAllProducts) ---
  describe('GET /products', () => {
    it('should render all products', async () => {
      const res = await request(app).get('/products');
      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('All Products');
      expect($('table tbody tr').length).toBeGreaterThan(0); // Should have products
      expect(res.text).toContain('Laptop Pro');
      expect(res.text).toContain('Wireless Mouse');
    });

    it('should render a message when no products are found', async () => {
      await Product.destroy({ truncate: true, restartIdentity: true }); // Clear all products
      const res = await request(app).get('/products');
      expect(res.statusCode).toEqual(200);
      const $ = parseHtml(res.text);
      expect($('p').text()).toContain('No products found.');
      expect($('table').length).toBe(0); // No table should be rendered
    });

    it('should return 500 on database error', async () => {
      jest.spyOn(Product, 'findAll').mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });
      const res = await request(app).get('/products');
      expect(res.statusCode).toEqual(500);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('500 - Server Error');
      expect($('.error-message').text()).toContain('Failed to retrieve products.');
    });
  });

  // --- GET /products/new (getNewProductForm) ---
  describe('GET /products/new', () => {
    it('should render the new product form', async () => {
      const res = await request(app).get('/products/new');
      expect(res.statusCode).toEqual(200);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('Add New Product');
      expect($('form[action="/products"][method="POST"]').length).toBe(1);
    });
  });

  // --- POST /products (createProduct) ---
  describe('POST /products', () => {
    it('should create a new product and redirect to /products', async () => {
      const newProductData = {
        name: 'New Gadget',
        description: 'A brand new awesome gadget.',
        price: '29.99',
        stock: '150',
        isActive: 'on',
      };
      const res = await request(app).post('/products').send(newProductData);
      expect(res.statusCode).toEqual(302);
      expect(res.headers.location).toEqual('/products');

      const createdProduct = await Product.findOne({ where: { name: 'New Gadget' } });
      expect(createdProduct).toBeDefined();
      expect(createdProduct.description).toBe('A brand new awesome gadget.');
      expect(parseFloat(createdProduct.price)).toBe(29.99);
      expect(createdProduct.stock).toBe(150);
      expect(createdProduct.isActive).toBe(true);
    });

    it('should create a new product with default values if not provided (description, stock, isActive)', async () => {
      const newProductData = {
        name: 'Product with Defaults',
        price: '10.00',
        // description, stock, isActive omitted
      };
      const res = await request(app).post('/products').send(newProductData);
      expect(res.statusCode).toEqual(302);
      const createdProduct = await Product.findOne({ where: { name: 'Product with Defaults' } });
      expect(createdProduct.description).toBeNull();
      expect(createdProduct.stock).toBe(0);
      expect(createdProduct.isActive).toBe(false); // Checkbox 'on' not sent, so false
    });

    it('should return 400 for invalid data (missing name)', async () => {
      const invalidProductData = {
        description: 'Invalid product without name',
        price: '10.00',
        stock: '10',
      };
      const res = await request(app).post('/products').send(invalidProductData);
      expect(res.statusCode).toEqual(400);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('Add New Product');
      expect($('.error-message').text()).toContain('Validation error: Product.name cannot be null');
    });

    it('should return 400 for invalid data (name too short)', async () => {
      const invalidProductData = {
        name: 'AB',
        price: '10.00',
        stock: '10',
      };
      const res = await request(app).post('/products').send(invalidProductData);
      expect(res.statusCode).toEqual(400);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('Add New Product');
      expect($('.error-message').text()).toContain('Validation error: Validation len on name failed');
    });

    it('should return 400 for duplicate product name', async () => {
      // Seed data already includes 'Laptop Pro'
      const duplicateProductData = {
        name: 'Laptop Pro',
        description: 'Another laptop, same name',
        price: '1500.00',
        stock: '50',
      };
      const res = await request(app).post('/products').send(duplicateProductData);
      expect(res.statusCode).toEqual(400);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('Add New Product');
      expect($('.error-message').text()).toContain('Product with this name already exists.');
    });

    it('should return 500 on database error during creation', async () => {
      jest.spyOn(Product, 'create').mockImplementationOnce(() => {
        throw new Error('Database write error');
      });
      const validProductData = {
        name: 'Error Product',
        price: '10.00',
        stock: '10',
      };
      const res = await request(app).post('/products').send(validProductData);
      expect(res.statusCode).toEqual(500);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('500 - Server Error');
      expect($('.error-message').text()).toContain('Failed to create product.');
    });
  });

  // --- GET /products/:id (getProductById) ---
  describe('GET /products/:id', () => {
    let existingProduct;
    beforeEach(async () => {
      // Re-seed creates default products, pick one.
      const products = await Product.findAll();
      existingProduct = products[0];
    });

    it('should render product details for a valid ID', async () => {
      const res = await request(app).get(`/products/${existingProduct.id}`);
      expect(res.statusCode).toEqual(200);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain(`Product Details: ${existingProduct.name}`);
      expect(res.text).toContain(existingProduct.description);
      expect(res.text).toContain(`$${existingProduct.price.toFixed(2)}`);
    });

    it('should return 404 for a non-existent product ID', async () => {
      const nonExistentId = 99999;
      const res = await request(app).get(`/products/${nonExistentId}`);
      expect(res.statusCode).toEqual(404);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('404 - Page Not Found');
    });

    it('should return 500 on database error', async () => {
      jest.spyOn(Product, 'findByPk').mockImplementationOnce(() => {
        throw new Error('Database read error');
      });
      const res = await request(app).get(`/products/${existingProduct.id}`);
      expect(res.statusCode).toEqual(500);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('500 - Server Error');
      expect($('.error-message').text()).toContain('Failed to retrieve product details.');
    });
  });

  // --- GET /products/:id/edit (getEditProductForm) ---
  describe('GET /products/:id/edit', () => {
    let existingProduct;
    beforeEach(async () => {
      const products = await Product.findAll();
      existingProduct = products[0];
    });

    it('should render the edit form for a valid ID', async () => {
      const res = await request(app).get(`/products/${existingProduct.id}/edit`);
      expect(res.statusCode).toEqual(200);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain(`Edit Product: ${existingProduct.name}`);
      expect($('form[action="/products/' + existingProduct.id + '"][method="POST"]').length).toBe(1);
      expect($('#name').val()).toBe(existingProduct.name);
      expect($('#price').val()).toBe(existingProduct.price.toString());
    });

    it('should return 404 for a non-existent product ID', async () => {
      const nonExistentId = 99999;
      const res = await request(app).get(`/products/${nonExistentId}/edit`);
      expect(res.statusCode).toEqual(404);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('404 - Page Not Found');
    });

    it('should return 500 on database error', async () => {
      jest.spyOn(Product, 'findByPk').mockImplementationOnce(() => {
        throw new Error('Database read error for edit form');
      });
      const res = await request(app).get(`/products/${existingProduct.id}/edit`);
      expect(res.statusCode).toEqual(500);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('500 - Server Error');
      expect($('.error-message').text()).toContain('Failed to load product for editing.');
    });
  });

  // --- POST /products/:id (updateProduct) ---
  describe('POST /products/:id', () => {
    let existingProduct;
    let otherProduct;
    beforeEach(async () => {
      const products = await Product.findAll();
      existingProduct = products[0]; // e.g., Laptop Pro
      otherProduct = products[1]; // e.g., Wireless Mouse
    });

    it('should update an existing product and redirect to its detail page', async () => {
      const updatedData = {
        name: 'Updated Laptop Pro Max',
        description: 'New and improved description',
        price: '1300.50',
        stock: '110',
        isActive: 'on',
      };
      const res = await request(app).post(`/products/${existingProduct.id}`).send(updatedData);
      expect(res.statusCode).toEqual(302);
      expect(res.headers.location).toEqual(`/products/${existingProduct.id}`);

      const updatedProduct = await Product.findByPk(existingProduct.id);
      expect(updatedProduct.name).toBe(updatedData.name);
      expect(updatedProduct.description).toBe(updatedData.description);
      expect(parseFloat(updatedProduct.price)).toBe(parseFloat(updatedData.price));
      expect(updatedProduct.stock).toBe(parseInt(updatedData.stock, 10));
      expect(updatedProduct.isActive).toBe(true);
    });

    it('should handle partial updates (e.g., only update description)', async () => {
      const updatedData = {
        name: existingProduct.name, // Keep existing name
        description: 'Only description changed',
        price: existingProduct.price.toString(),
        stock: existingProduct.stock.toString(),
        isActive: existingProduct.isActive ? 'on' : '',
      };
      const res = await request(app).post(`/products/${existingProduct.id}`).send(updatedData);
      expect(res.statusCode).toEqual(302);

      const updatedProduct = await Product.findByPk(existingProduct.id);
      expect(updatedProduct.description).toBe('Only description changed');
      expect(updatedProduct.name).toBe(existingProduct.name); // Should remain same
    });

    it('should return 404 for updating a non-existent product', async () => {
      const nonExistentId = 99999;
      const updatedData = { name: 'Non Existent', price: '10', stock: '10' };
      const res = await request(app).post(`/products/${nonExistentId}`).send(updatedData);
      expect(res.statusCode).toEqual(404);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('404 - Page Not Found');
    });

    it('should return 400 for invalid data (empty name)', async () => {
      const invalidData = {
        name: '', // Invalid name
        price: '100.00',
        stock: '10',
      };
      const res = await request(app).post(`/products/${existingProduct.id}`).send(invalidData);
      expect(res.statusCode).toEqual(400);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('Edit Product');
      expect($('.error-message').text()).toContain('Validation error: Validation notEmpty on name failed');
      expect($('#name').val()).toBe(''); // Form should show submitted invalid data
    });

    it('should return 400 for duplicate name during update', async () => {
      // Try to update existingProduct's name to otherProduct's name
      const duplicateNameData = {
        name: otherProduct.name, // 'Wireless Mouse'
        description: existingProduct.description,
        price: existingProduct.price.toString(),
        stock: existingProduct.stock.toString(),
      };
      const res = await request(app).post(`/products/${existingProduct.id}`).send(duplicateNameData);
      expect(res.statusCode).toEqual(400);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('Edit Product');
      expect($('.error-message').text()).toContain('Product with this name already exists.');
      expect($('#name').val()).toBe(otherProduct.name); // Form should show submitted invalid data
    });

    it('should return 500 on database error during update', async () => {
      jest.spyOn(Product.prototype, 'update').mockImplementationOnce(() => {
        throw new Error('Database update error');
      });
      const validData = { name: 'New Name', price: '100', stock: '10' };
      const res = await request(app).post(`/products/${existingProduct.id}`).send(validData);
      expect(res.statusCode).toEqual(500);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('500 - Server Error');
      expect($('.error-message').text()).toContain('Failed to update product.');
    });
  });

  // --- POST /products/:id/delete (deleteProduct) ---
  describe('POST /products/:id/delete', () => {
    let productToDelete;
    beforeEach(async () => {
      productToDelete = await Product.create({ name: 'To Be Deleted', price: 10, stock: 10 });
    });

    it('should delete a product and redirect to /products', async () => {
      const res = await request(app).post(`/products/${productToDelete.id}/delete`);
      expect(res.statusCode).toEqual(302);
      expect(res.headers.location).toEqual('/products');

      const deletedProduct = await Product.findByPk(productToDelete.id);
      expect(deletedProduct).toBeNull();
    });

    it('should return 404 for deleting a non-existent product', async () => {
      const nonExistentId = 99999;
      const res = await request(app).post(`/products/${nonExistentId}/delete`);
      expect(res.statusCode).toEqual(404);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('404 - Page Not Found');
    });

    it('should return 500 on database error', async () => {
      jest.spyOn(Product.prototype, 'destroy').mockImplementationOnce(() => {
        throw new Error('Database delete error');
      });
      const res = await request(app).post(`/products/${productToDelete.id}/delete`);
      expect(res.statusCode).toEqual(500);
      const $ = parseHtml(res.text);
      expect($('h1').text()).toContain('500 - Server Error');
      expect($('.error-message').text()).toContain('Failed to delete product.');
    });
  });
});
