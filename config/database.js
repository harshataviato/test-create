// Load environment variables from .env file
require('dotenv').config();

// Import Sequelize library
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Define the database URL from environment variables, defaulting to an in-memory database
const DATABASE_URL = process.env.DATABASE_URL || 'sqlite::memory:';

// Ensure the directory for the SQLite database file exists if it's a file path
if (DATABASE_URL.startsWith('./') || DATABASE_URL.startsWith('/')) {
  const dbPath = path.dirname(DATABASE_URL);
  // Check if the directory exists, if not, create it synchronously
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
    console.log(`Created database directory: ${dbPath}`);
  }
}

/**
 * Initialize Sequelize instance.
 * It connects to a SQLite database.
 * @param {string} databaseUrl - The URL or path for the database.
 * @returns {Sequelize} The initialized Sequelize instance.
 */
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DATABASE_URL, // Path to the SQLite database file
  logging: false, // Set to true to see SQL queries in console
});

/**
 * Synchronizes all defined models with the database.
 * This will create tables if they don't exist.
 * In a production environment, proper migration tools (like Umzug) are recommended.
 */
async function syncDatabase() {
  try {
    // `alter: true` will check the current state of the table in the database
    // and make the necessary changes to make it match the model.
    // Be careful with `alter: true` in production, as it can lead to data loss
    // in some scenarios (e.g., column type changes, column removal).
    await sequelize.sync({ alter: true });
    console.log('Database schema synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database schema:', error);
    throw error; // Re-throw the error for the calling function to handle
  }
}

/**
 * Seeds the database with initial data.
 * This is useful for development or populating a new database.
 */
async function seedDatabase() {
  // Import the Product model here to avoid circular dependencies
  const Product = require('../models/product')(sequelize, DataTypes);

  try {
    // Check if any products already exist to prevent duplicate seeding
    const productCount = await Product.count();
    if (productCount > 0) {
      console.log('Database already contains products. Skipping seeding.');
      return;
    }

    await Product.bulkCreate([
      { name: 'Laptop Pro', description: 'Powerful laptop for professionals.', price: 1200.00 },
      { name: 'Wireless Mouse', description: 'Ergonomic mouse with long battery life.', price: 25.50 },
      { name: 'Mechanical Keyboard', description: 'RGB backlit keyboard with tactile switches.', price: 75.00 },
      { name: 'USB-C Hub', description: '7-in-1 USB-C adapter with HDMI.', price: 40.00 },
      { name: 'External SSD 1TB', description: 'Fast and portable storage solution.', price: 99.99 }
    ]);
    console.log('Database seeded with initial product data.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Handle command line arguments for database operations (e.g., `npm run db:migrate`, `npm run db:seed`)
// This block allows direct execution of `node config/database.js sync` or `node config/database.js seed`
if (require.main === module) {
  const args = process.argv.slice(2); // Get command-line arguments starting from index 2

  if (args.includes('sync')) {
    syncDatabase()
      .then(() => {
        console.log('Database synchronization complete.');
        process.exit(0);
      })
      .catch((err) => {
        console.error('Database synchronization failed:', err);
        process.exit(1);
      });
  } else if (args.includes('seed')) {
    seedDatabase()
      .then(() => {
        console.log('Database seeding complete.');
        process.exit(0);
      })
      .catch((err) => {
        console.error('Database seeding failed:', err);
        process.exit(1);
      });
  } else {
    console.log('No specific database command provided. Use `sync` or `seed`.');
    // If running as main, and no specific command, assume default behavior might be to just connect
    // For this setup, we rely on app.js to call sync on startup normally.
  }
}

// Export the sequelize instance and the sync/seed functions
module.exports = {
  sequelize,
  syncDatabase,
  seedDatabase,
};
