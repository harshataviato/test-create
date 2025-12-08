/**
 * @module config/app.config
 * @description
 * Centralized application configuration settings, loaded from environment variables.
 * Provides default values and type-safe access to configuration properties.
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Interface representing the application configuration.
 */
interface AppConfig {
  port: number;
  nodeEnv: string;
  database: {
    host: string;
    port: number;
    username: string;
    password?: string;
    name: string;
    synchronize: boolean;
    logging: boolean;
  };
  sessionSecret: string;
  pageSize: number;
}

/**
 * Application configuration object.
 * Reads values from environment variables with sensible defaults.
 */
export const appConfig: AppConfig = {
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'petclinic',
    password: process.env.DB_PASSWORD || 'petclinic',
    name: process.env.DB_DATABASE || 'petclinic',
    // In production, migrations should be run explicitly, not synchronized automatically
    synchronize: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',
    logging: process.env.NODE_ENV === 'development',
  },
  sessionSecret: process.env.SESSION_SECRET || 'supersecretkeyforpetclinic',
  pageSize: parseInt(process.env.PAGE_SIZE || '5', 10), // Default page size for lists
};
