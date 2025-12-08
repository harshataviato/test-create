/**
 * @module config/database
 * @description TypeORM configuration for the PetClinic application.
 *              Connects to a PostgreSQL database and loads all entities and migrations.
 */

import { DataSource, DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

/**
 * @interface DatabaseConfigOptions
 * @description Interface defining the structure for database configuration options.
 */
interface DatabaseConfigOptions {
  type: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  entities: string[];
  migrations: string[];
  subscribers: string[];
}

/**
 * @constant AppDataSourceOptions
 * @description TypeORM DataSourceOptions object configured from environment variables.
 */
const AppDataSourceOptions: DataSourceOptions = {
  type: 'postgres', // Using PostgreSQL as per the docker-compose setup
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'petclinic',
  password: process.env.DB_PASSWORD || 'petclinic',
  database: process.env.DB_NAME || 'petclinic',
  synchronize: false, // Set to false in production; migrations handle schema
  logging: ['query', 'error'], // Enable logging for queries and errors
  entities: [path.join(__dirname, '../models/**/*.ts')], // Path to all TypeORM entities
  migrations: [path.join(__dirname, '../database/migrations/**/*.ts')], // Path to all TypeORM migrations
  subscribers: [], // No subscribers configured
};

/**
 * @constant AppDataSource
 * @description TypeORM DataSource instance created with the configured options.
 *              This is used to interact with the database.
 */
export const AppDataSource = new DataSource(AppDataSourceOptions);
