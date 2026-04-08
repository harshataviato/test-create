const { sequelize, syncDatabase } = require('../config/database');
const { DataTypes } = require('sequelize');
const Product = require('../models/product')(sequelize, DataTypes);

describe('Product Model', () => {
  // Before all tests, synchronize the database (create tables)
  beforeAll(async () => {
    // Ensure we are using an in-memory database for tests
    process.env.DATABASE_URL = 'sqlite::memory:';
    await sequelize.authenticate();
    await syncDatabase();
  });

  // Before each test, clear the Product table
  beforeEach(async () => {
    await Product.destroy({ truncate: true, restartIdentity: true }); // Clear table and reset auto-increment
  });

  // After all tests, close the database connection
  afterAll(async () => {
    await sequelize.close();
  });

  // --- Success Cases ---

  it('should create a product successfully with all valid fields', async () => {
    const product = await Product.create({
      name: 'Test Product 1',
      description: 'Description for Test Product 1',
      price: 10.99,
      stock: 100,
      isActive: true,
    });

    expect(product).toBeDefined();
    expect(product.id).toBeDefined();
    expect(product.name).toBe('Test Product 1');
    expect(product.description).toBe('Description for Test Product 1');
    expect(parseFloat(product.price)).toBe(10.99); // price is DECIMAL, parse to float for comparison
    expect(product.stock).toBe(100);
    expect(product.isActive).toBe(true);
    expect(product.createdAt).toBeDefined();
    expect(product.updatedAt).toBeDefined();
  });

  it('should create a product with default values for stock and isActive', async () => {
    const product = await Product.create({
      name: 'Default Product',
      price: 50.00,
      description: 'This product uses default stock and active status.',
      // stock and isActive are omitted
    });

    expect(product).toBeDefined();
    expect(product.stock).toBe(0); // Default value
    expect(product.isActive).toBe(true); // Default value
  });

  it('should allow a null description', async () => {
    const product = await Product.create({
      name: 'Product with Null Description',
      price: 15.00,
      stock: 50,
      description: null, // Explicitly null
    });

    expect(product).toBeDefined();
    expect(product.description).toBeNull();
  });

  it('should allow an empty string description, which converts to null', async () => {
    const product = await Product.create({
      name: 'Product with Empty Description',
      price: 15.00,
      stock: 50,
      description: '', // Empty string
    });

    expect(product).toBeDefined();
    // Sequelize maps empty string to null if allowNull is true and type is TEXT/STRING
    expect(product.description).toBeNull();
  });

  it('should retrieve a product by ID', async () => {
    const createdProduct = await Product.create({
      name: 'Retrieve Me',
      price: 20.00,
      stock: 10,
    });

    const foundProduct = await Product.findByPk(createdProduct.id);
    expect(foundProduct).toBeDefined();
    expect(foundProduct.name).toBe('Retrieve Me');
  });

  it('should update product fields successfully', async () => {
    const product = await Product.create({
      name: 'Old Name',
      price: 10.00,
      stock: 10,
      isActive: true,
    });

    await product.update({
      name: 'New Name',
      price: 12.50,
      stock: 20,
      isActive: false,
    });

    const updatedProduct = await Product.findByPk(product.id);
    expect(updatedProduct.name).toBe('New Name');
    expect(parseFloat(updatedProduct.price)).toBe(12.50);
    expect(updatedProduct.stock).toBe(20);
    expect(updatedProduct.isActive).toBe(false);
  });

  it('should delete a product successfully', async () => {
    const product = await Product.create({
      name: 'Delete Me',
      price: 5.00,
      stock: 5,
    });

    await product.destroy();

    const foundProduct = await Product.findByPk(product.id);
    expect(foundProduct).toBeNull();
  });

  // --- Validation and Error Cases ---

  it('should not create a product without a name', async () => {
    await expect(
      Product.create({
        description: 'No name product',
        price: 10.00,
        stock: 10,
      })
    ).rejects.toThrow('notNull Violation: Product.name cannot be null');
  });

  it('should not create a product with an empty name', async () => {
    await expect(
      Product.create({
        name: '',
        price: 10.00,
        stock: 10,
      })
    ).rejects.toThrow('Validation error: Validation notEmpty on name failed');
  });

  it('should not create a product with a name shorter than 3 characters', async () => {
    await expect(
      Product.create({
        name: 'AB',
        price: 10.00,
        stock: 10,
      })
    ).rejects.toThrow('Validation error: Validation len on name failed');
  });

  it('should not create a product with a name longer than 100 characters', async () => {
    const longName = 'a'.repeat(101); // 101 characters
    await expect(
      Product.create({
        name: longName,
        price: 10.00,
        stock: 10,
      })
    ).rejects.toThrow('Validation error: Validation len on name failed');
  });

  it('should not create a product with a duplicate name', async () => {
    await Product.create({ name: 'Unique Name', price: 10.00, stock: 10 });

    await expect(
      Product.create({ name: 'Unique Name', price: 20.00, stock: 20 })
    ).rejects.toThrow('SQLITE_CONSTRAINT: UNIQUE constraint failed: Products.name');
  });

  it('should not create a product with a negative price', async () => {
    await expect(
      Product.create({
        name: 'Negative Price Product',
        price: -5.00,
        stock: 10,
      })
    ).rejects.toThrow('Validation error: Validation min on price failed');
  });

  it('should not create a product with a non-decimal price', async () => {
    // Sequelize will attempt to cast, but if it's completely invalid, it might throw
    // Example: price: 'abc'
    await expect(
        Product.create({
            name: 'Invalid Price Type',
            price: 'abc', // This will cause a validation error
            stock: 10
        })
    ).rejects.toThrow('Validation error: Validation isDecimal on price failed');
  });

  it('should not create a product with a negative stock', async () => {
    await expect(
      Product.create({
        name: 'Negative Stock Product',
        price: 10.00,
        stock: -1,
      })
    ).rejects.toThrow('Validation error: Validation min on stock failed');
  });

  it('should not allow a description longer than 500 characters', async () => {
    const longDescription = 'a'.repeat(501); // 501 characters
    await expect(
      Product.create({
        name: 'Long Desc Product',
        price: 10.00,
        stock: 10,
        description: longDescription,
      })
    ).rejects.toThrow('Validation error: Validation len on description failed');
  });

  it('should not update a product to have a duplicate name', async () => {
    await Product.create({ name: 'Product A', price: 10.00, stock: 10 });
    const productB = await Product.create({ name: 'Product B', price: 20.00, stock: 20 });

    await expect(
      productB.update({ name: 'Product A' })
    ).rejects.toThrow('SQLITE_CONSTRAINT: UNIQUE constraint failed: Products.name');
  });

  it('should not update a product to have an invalid price', async () => {
    const product = await Product.create({ name: 'Product C', price: 10.00, stock: 10 });
    await expect(
      product.update({ price: -100.00 })
    ).rejects.toThrow('Validation error: Validation min on price failed');
  });
});
