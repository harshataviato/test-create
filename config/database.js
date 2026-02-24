import { Sequelize } from 'sequelize';

// Pragmatic choice: Use SQLite for zero-config local development (like H2).
// In production, this connection string would come from process.env for MySQL/Postgres.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './petclinic.sqlite',
  logging: false, // Turn off SQL logging for cleaner console output
});

export default sequelize;
