import { DataSource } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { Owner } from '../owners/entities/owner.entity';
import { Pet } from '../owners/entities/pet.entity';
import { PetType } from '../owners/entities/pet-type.entity';
import { Visit } from '../owners/entities/visit.entity';
import { Vet } from '../vets/entities/vet.entity';
import { Specialty } from '../vets/entities/specialty.entity';

// Load environment variables from .env file
dotenv.config();

/**
 * @module Config
 * @description
 * TypeORM Data Source configuration.
 * This configuration defines how TypeORM connects to the database,
 * which entities to load, and where to find migrations.
 * It uses environment variables for database connection details.
 */
export const AppDataSource = new DataSource({
  type: 'postgres', // Using PostgreSQL as per the original project's configuration for persistence
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USERNAME || 'petclinic',
  password: process.env.DATABASE_PASSWORD || 'petclinic',
  database: process.env.DATABASE_NAME || 'petclinic',
  synchronize: false, // Set to true only for development, use migrations for production
  logging: ['query', 'error'], // Log database queries and errors

  // List all entities to be managed by TypeORM
  entities: [Owner, Pet, PetType, Visit, Vet, Specialty],

  // Specify the path to migration files
  // These are JavaScript files generated from TypeScript migrations
  migrations: [join(__dirname, '..', 'migrations', '*.js')],
  
  // Disable ssl for local development, enable if connecting to a cloud database that requires it
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

/**
 * Initializes the TypeORM data source.
 * This function should be called during application bootstrap to ensure
 * the database connection is established.
 *
 * @returns {Promise<DataSource>} A promise that resolves to the initialized DataSource.
 */
export const initializeDataSource = async (): Promise<DataSource> => {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log('Data Source has been initialized!');
    } catch (err) {
      console.error('Error during Data Source initialization', err);
      throw err;
    }
  }
  return AppDataSource;
};
