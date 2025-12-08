import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Owner } from '../modules/owner/entities/owner.entity';
import { Pet } from '../modules/owner/entities/pet.entity';
import { PetType } from '../modules/owner/entities/pet-type.entity';
import { Visit } from '../modules/owner/entities/visit.entity';
import { Vet } from '../modules/vet/entities/vet.entity';
import { Specialty } from '../modules/vet/entities/specialty.entity';

/**
 * Database configuration settings for TypeORM.
 * This function loads database parameters from environment variables and defines TypeORM options.
 * It supports H2 (SQLite in this context), MySQL, and PostgreSQL.
 * @returns TypeOrmModuleOptions object for database connection.
 */
export default () => {
  const dbType = process.env.DB_TYPE || 'sqlite'; // Default to sqlite (H2 equivalent)
  let options: TypeOrmModuleOptions;

  switch (dbType) {
    case 'mysql':
      options = {
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        username: process.env.DB_USERNAME || 'petclinic',
        password: process.env.DB_PASSWORD || 'petclinic',
        database: process.env.DB_DATABASE || 'petclinic',
        entities: [Owner, Pet, PetType, Visit, Vet, Specialty], // List all entities here
        synchronize: true, // WARNING: Should be false in production, use migrations instead
        logging: ['query', 'error'], // Log database queries and errors
      };
      break;
    case 'postgres':
      options = {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        username: process.env.DB_USERNAME || 'petclinic',
        password: process.env.DB_PASSWORD || 'petclinic',
        database: process.env.DB_DATABASE || 'petclinic',
        entities: [Owner, Pet, PetType, Visit, Vet, Specialty], // List all entities here
        synchronize: true, // WARNING: Should be false in production, use migrations instead
        logging: ['query', 'error'], // Log database queries and errors
      };
      break;
    case 'sqlite': // Representing H2 for development simplicity
    default:
      options = {
        type: 'sqlite',
        database: process.env.DB_DATABASE || ':memory:', // Use in-memory SQLite database
        entities: [Owner, Pet, PetType, Visit, Vet, Specialty], // List all entities here
        synchronize: true, // Automatically create schema on app start (for development)
        logging: ['query', 'error'], // Log database queries and errors
      };
      break;
  }
  return options;
};
