const { sequelize, syncDatabase, seedDatabase } = require('../config/database');
const { DataTypes } = require('sequelize');
const Product = require('../models/product')(sequelize, DataTypes);

describe('Database Configuration and Seeding', () => {
  // Before all tests, ensure a clean in-memory database
  beforeAll(async () => {
    process.env.DATABASE_URL = 'sqlite::memory:';
    await sequelize.authenticate();
    await syncDatabase(); // Create tables based on models
  });

  // Before each test, clear the Product table to ensure a fresh state
  beforeEach(async () => {
    await Product.destroy({ truncate: true, restartIdentity: true });
  });

  // After all tests, close the database connection
  afterAll(async () => {
    await sequelize.close();
  });

  it('should synchronize database successfully', async () => {
    // syncDatabase is called in beforeAll, so we just check if tables exist
    // A simple check is to try inserting data
    const product = await Product.create({
      name: 'Sync Test Product',
      price: 1.99,
      stock: 1,
    });
    expect(product).toBeDefined();
    expect(product.id).toBeDefined();
  });

  it('should seed database successfully when empty', async () => {
    const initialCount = await Product.count();
    expect(initialCount).toBe(0); // Should be empty from beforeEach

    await seedDatabase();

    const seededCount = await Product.count();
    expect(seededCount).toBe(5); // Expect 5 products from seed data
    const productNames = (await Product.findAll()).map(p => p.name);
    expect(productNames).toContain('Laptop Pro');
    expect(productNames).toContain('Wireless Mouse');
  });

  it('should not seed database if products already exist', async () => {
    // Create one product manually
    await Product.create({ name: 'Existing Product', price: 100, stock: 10 });
    const initialCount = await Product.count();
    expect(initialCount).toBe(1);

    // Attempt to seed
    await seedDatabase();

    // Count should still be 1 because seeding should be skipped
    const finalCount = await Product.count();
    expect(finalCount).toBe(1);
    const productNames = (await Product.findAll()).map(p => p.name);
    expect(productNames).toContain('Existing Product');
    expect(productNames).not.toContain('Laptop Pro'); // Seed data not added
  });

  it('should handle synchronization errors', async () => {
    // Mock sequelize.sync to throw an error
    const originalSync = sequelize.sync;
    sequelize.sync = jest.fn().mockImplementation(() => {
      throw new Error('Fake sync error');
    });

    await expect(syncDatabase()).rejects.toThrow('Fake sync error');

    // Restore original sync function
    sequelize.sync = originalSync;
  });

  it('should handle seed errors', async () => {
    // Mock Product.bulkCreate to throw an error
    const originalBulkCreate = Product.bulkCreate;
    Product.bulkCreate = jest.fn().mockImplementation(() => {
      throw new Error('Fake bulkCreate error');
    });

    await expect(seedDatabase()).rejects.toThrow('Fake bulkCreate error');

    // Restore original bulkCreate function
    Product.bulkCreate = originalBulkCreate;
  });
});
