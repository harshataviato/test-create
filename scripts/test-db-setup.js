/**
 * @file Test Database Setup Script
 * @description This script is used to set up the PostgreSQL test database.
 * It ensures the `petclinic_test` database schema is created and can be optionally seeded
 * or just prepared for tests that seed their own data.
 * This script is called by `npm test`.
 */

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// IMPORTANT: Override DB_NAME for testing
process.env.DB_NAME = 'petclinic_test';
// Reload config after changing DB_NAME
delete require.cache[require.resolve('../src/config')];
const config = require('../src/config');

// Create a new Pool instance specifically for setup, connecting as a superuser to manage databases
const setupPool = new Pool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: 'postgres', // Connect to default postgres database to manage petclinic_test
  port: config.db.port,
  ssl: config.db.ssl ? { rejectUnauthorized: false } : false
});

const testDbPool = new Pool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database, // petclinic_test
  port: config.db.port,
  ssl: config.db.ssl ? { rejectUnauthorized: false } : false
});

const schemaSqlPath = path.join(__dirname, '../db/postgres/schema.sql');
const dataSqlPath = path.join(__dirname, '../db/postgres/data.sql'); // Use original data for initial seeding if needed

async function runSqlFile(client, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await client.query(sql);
}

async function setupTestDatabase() {
  let client;
  try {
    console.log(`[Test DB Setup] Connecting to PostgreSQL at ${config.db.host}:${config.db.port}...`);
    client = await setupPool.connect();

    // Check if test database exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [config.db.database]);
    if (res.rowCount === 0) {
      console.log(`[Test DB Setup] Creating database ${config.db.database}...`);
      await client.query(`CREATE DATABASE ${config.db.database} OWNER ${config.db.user};`);
      console.log(`[Test DB Setup] Database ${config.db.database} created.`);
    } else {
      console.log(`[Test DB Setup] Database ${config.db.database} already exists.`);
    }

    client.release(); // Release superuser client

    console.log(`[Test DB Setup] Connecting to ${config.db.database} for schema setup...`);
    const dbClient = await testDbPool.connect();
    console.log('[Test DB Setup] Dropping existing tables...');
    // Drop all tables in public schema safely
    const dropTablesSql = `
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END $$;
    `;
    await dbClient.query(dropTablesSql);
    console.log('[Test DB Setup] Running schema.sql...');
    await runSqlFile(dbClient, schemaSqlPath);
    console.log('[Test DB Setup] Schema created.');

    // Optionally seed with some base data for general tests, or leave it to individual test suites.
    // For this project, individual test suites will handle seeding to ensure isolation.
    // console.log('[Test DB Setup] Running data.sql for initial test data...');
    // await runSqlFile(dbClient, dataSqlPath);
    // console.log('[Test DB Setup] Initial test data loaded.');

    dbClient.release();
    console.log('[Test DB Setup] Test database setup complete.');

  } catch (error) {
    console.error('[Test DB Setup] Failed to set up test database:', error);
    process.exit(1); // Exit with error code
  } finally {
    await setupPool.end();
    await testDbPool.end();
  }
}

setupTestDatabase();

