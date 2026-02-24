/**
 * Database configuration for Sequelize.
 * Defaults to SQLite for a self-contained setup similar to the Java H2 configuration.
 */
module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './petclinic.sqlite', // File-based SQLite DB
    logging: false // Disable SQL query logging in console for cleaner output
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:'
  },
  production: {
    dialect: 'sqlite',
    storage: './petclinic.sqlite'
  }
};
