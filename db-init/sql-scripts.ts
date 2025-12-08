/**
 * @module db-init/sql-scripts
 * @description
 * Script to execute SQL data initialization scripts after TypeORM migrations.
 * This is used to populate the database with initial sample data.
 */

import { AppDataSource } from '../src/config/data-source';
import fs from 'fs';
import path from 'path';

/**
 * Path to the PostgreSQL data SQL script.
 */
const POSTGRES_DATA_SQL = path.join(__dirname, 'postgres', 'data.sql');

/**
 * Initializes the database by executing SQL scripts.
 * This function connects to the database, reads the SQL file, and executes its contents.
 */
async function initializeData(): Promise<void> {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    // Read the data SQL script for PostgreSQL
    const dataSql = fs.readFileSync(POSTGRES_DATA_SQL, 'utf8');

    // Execute the SQL script
    await queryRunner.query(dataSql);
    console.log('Database data initialized successfully from data.sql.');
  } catch (error) {
    console.error('Error initializing database data:', error);
    process.exit(1); // Exit with a failure code
  } finally {
    // Release the query runner connection
    await queryRunner.release();
    await AppDataSource.destroy(); // Close the database connection
  }
}

// Execute the data initialization
initializeData();
