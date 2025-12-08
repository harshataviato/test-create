/**
 * @module config/data-source
 * @description
 * TypeORM data source configuration for connecting to the PostgreSQL database.
 * This file defines the entities, migrations, and database connection details.
 */

import { DataSource } from 'typeorm';
import { appConfig } from './app.config';

// Import all entities
import { BaseEntity } from '../models/base.entity';
import { NamedEntity } from '../models/named.entity';
import { Person } from '../models/person.entity';
import { Owner } from '../models/owner/owner.entity';
import { Pet } from '../models/owner/pet.entity';
import { PetType } from '../models/owner/pet-type.entity';
import { Visit } from '../models/owner/visit.entity';
import { Specialty } from '../models/vet/specialty.entity';
import { Vet } from '../models/vet/vet.entity';
import { InitialSchema1701999999999 } from '../migrations/1701999999999-InitialSchema';


/**
 * TypeORM AppDataSource configuration.
 * Configures the connection to the PostgreSQL database using settings from app.config.ts.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.username,
  password: appConfig.database.password,
  database: appConfig.database.name,
  synchronize: appConfig.database.synchronize, // WARNING: set to false in production and use migrations
  logging: appConfig.database.logging,
  entities: [
    BaseEntity, NamedEntity, Person, // Core models
    Owner, Pet, PetType, Visit,      // Owner-related models
    Specialty, Vet                   // Vet-related models
  ],
  migrations: [InitialSchema1701999999999], // List of migration classes
  subscribers: [],
});
