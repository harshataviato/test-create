/**
 * @module config/sequelize
 * @description Command-line utility for Sequelize migrations and seeding.
 * This file is intended to be run directly via `node config/sequelize.js [command]`.
 */

const path = require('path');
const { Umzug, SequelizeStorage } = require('umzug'); // For migrations
const db = require('./database'); // Our database configuration

const sequelize = db.sequelize;

/**
 * @function setupUmzug
 * @description Configures Umzug for managing database migrations.
 * @returns {Umzug} An instance of Umzug.
 */
const umzug = new Umzug({
  migrations: {
    glob: ['migrations/*.js', { cwd: __dirname + '/../' }], // Point to the migrations directory
    // Ensure migrations are functions that take `queryInterface` and `Sequelize`
    resolve: ({ name, path: migrationPath, context }) => {
      const migration = require(migrationPath);
      return {
        name,
        up: async () => migration.up(context.queryInterface, context.Sequelize),
        down: async () => migration.down(context.queryInterface, context.Sequelize),
      };
    },
  },
  context: { queryInterface: sequelize.getQueryInterface(), Sequelize: db.Sequelize },
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

/**
 * @function runMigrations
 * @description Runs pending database migrations.
 * @async
 */
async function runMigrations() {
  console.log('Running database migrations...');
  try {
    const migrations = await umzug.up();
    console.log('Migrations executed:', migrations.map(m => m.name));
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

/**
 * @function runSeeders
 * @description Runs database seeders.
 * @async
 */
async function runSeeders() {
  console.log('Running database seeders...');
  try {
    await require('./seedData').seed(); // Use our seedData.js directly
    console.log('Seed data successfully inserted.');
  } catch (error) {
    console.error('Error running seeders:', error);
    process.exit(1);
  }
}

// Command-line interface for migrations and seeding
const command = process.argv[2];

if (command === 'migrate') {
  runMigrations().then(() => process.exit(0));
} else if (command === 'seed') {
  runSeeders().then(() => process.exit(0));
} else {
  console.log('Usage: node config/sequelize.js [migrate|seed]');
  process.exit(1);
}
