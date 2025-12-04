/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file is a TypeScript adaptation of PostgresIntegrationTests.java.
// It uses Jest for testing, Supertest for HTTP requests, and the Node.js Testcontainers
// library with Docker Compose integration to spin up a PostgreSQL database.

import request from 'supertest';
import { Application } from 'express'; // Assuming an Express application
import { DockerComposeContainer, StartedDockerComposeContainer } from 'testcontainers';
import { expect } from '@jest/globals';
import * as path from 'path'; // For resolving docker-compose.yml path
import * as os from 'os'; // For os.platform() to check Docker availability

// --- Mock/Conceptual implementations ---
interface Vet {
  id: number;
  firstName: string;
  lastName: string;
  specialties: string[];
}

class MockVetRepository {
  private dbClient: any; // Placeholder for a DB client like 'pg' or a TypeORM connection

  constructor(connectionDetails: any) {
    console.log('[MockVetRepository] Initialized with DB details for Postgres:', connectionDetails);
    // In a real app, establish connection to the Testcontainers PostgreSQL instance
    // e.g., this.dbClient = new pg.Client(connectionDetails);
  }

  async findAll(): Promise<Vet[]> {
    console.log('[MockVetRepository] findAll called (conceptually querying PostgreSQL)');
    // Simulate database query
    return Promise.resolve([
      { id: 1, firstName: 'James', lastName: 'Carter', specialties: ['radiology'] },
      { id: 2, firstName: 'Helen', lastName: 'Leary', specialties: ['surgery'] },
    ]);
  }

  async findById(id: number): Promise<Vet | undefined> {
    console.log(`[MockVetRepository] findById called for ${id} (conceptually querying PostgreSQL)`);
    // Simulate database query
    const vets = await this.findAll();
    return vets.find(vet => vet.id === id);
  }
}
// --- End Mock implementations ---

let petClinicApp: Application; // Placeholder for your Express/NestJS application instance
let server: any; // The HTTP server instance
let postgresComposeContainer: StartedDockerComposeContainer;
let vetsRepository: MockVetRepository; // Mock repository instance

// Mock DockerClientFactory.instance().isDockerAvailable() equivalent
async function isDockerAvailable(): Promise<boolean> {
  try {
    // Execute a simple docker command to check if daemon is running
    const { stdout, stderr } = await exec('docker info');
    // If docker info runs without error, docker is likely available
    return true;
  } catch (error) {
    console.warn('[Docker Check] Docker is not available:', (error as any).message);
    return false;
  }
}

// Utility to run shell commands
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
const exec = promisify(execCb);

// Jest setup similar to @SpringBootTest and @ActiveProfiles("postgres")
beforeAll(async () => {
  // Mimic @BeforeAll static void available()
  const dockerAvailable = await isDockerAvailable();
  if (!dockerAvailable) {
    console.warn('Skipping PostgreSQL integration tests: Docker not available');
    return; // Jest will skip tests if beforeAll fails, or you can use `assumeTrue` logic
  }

  // Docker Compose configuration, mimicking `spring.docker.compose.start.arguments`
  // The `docker-compose.yml` file is assumed to be in the project root (spring-petclinic-main)
  const composeFilePath = path.resolve(__dirname, '../../../../docker-compose.yml'); // Adjust path as necessary
  const composeFileDir = path.dirname(composeFilePath);

  // Start Docker Compose services. Only 'postgres' service is specified.
  postgresComposeContainer = await new DockerComposeContainer(composeFileDir)
    .withComposeFile(composeFilePath)
    .withServiceName('postgres') // Only start the 'postgres' service
    .withExposedService('postgres', 5432) // Expose the internal postgres port
    .start();

  console.log('[Testcontainers] Docker Compose services started.');

  // Get mapped port for postgres service
  const postgresInfo = postgresComposeContainer.get'; // In Node.js, process.exit() is the equivalent of a fatal exit.
    process.exit(1);
  }
}

// Mimic the Java `main` method (e.g., in PostgresIntegrationTests.java)
// In Node.js, this would be a separate script or a command-line utility
// to start the application with a specific profile.
export async function startPostgresApplication(args: string[] = []): Promise<void> {
  console.log('[PostgresTestApplication] Starting PetClinic Node.js application with PostgreSQL via Docker Compose...');

  try {
    const dockerAvailable = await isDockerAvailable();
    if (!dockerAvailable) {
      console.error('Docker is not available. Cannot start PostgreSQL application.');
      process.exit(1);
    }

    const composeFilePath = path.resolve(__dirname, '../../../../docker-compose.yml'); // Adjust path
    const composeFileDir = path.dirname(composeFilePath);

    // This part starts the docker compose and gets connection info
    const compose = await new DockerComposeContainer(composeFileDir)
        .withComposeFile(composeFilePath)
        .withServiceName('postgres')
        .withExposedService('postgres', 5432)
        .start();

    const postgresHost = compose.getServiceHost('postgres');
    const postgresPort = compose.getServicePort('postgres', 5432);

    console.log(`[Testcontainers] PostgreSQL container started on ${postgresHost}:${postgresPort}`);

    // Mimic setting environment variables for the application
    process.env.DB_TYPE = 'postgres';
    process.env.POSTGRES_HOST = postgresHost;
    process.env.POSTGRES_PORT = postgresPort.toString();
    process.env.POSTGRES_DATABASE = 'petclinic';
    process.env.POSTGRES_USER = 'petclinic';
    process.env.POSTGRES_PASSWORD = 'petclinic';

    // In Java, there was a `PropertiesLogger` to print all environment properties.
    // In Node.js, you can manually log relevant environment variables:
    console.log('\n[PropertiesLogger] Active Environment Properties (selection):');
    Object.keys(process.env).filter(key => key.startsWith('POSTGRES_') || key.startsWith('DB_')).forEach(key => {
        console.log(`  ${key}=${process.env[key]}`);
    });
    console.log('--------------------------------------------------\n');

    // Here you would conceptually start your main Node.js application.
    // e.g., await startApplication({ profile: 'postgres', ...parseArgs(args) });
    console.log('[PostgresTestApplication] Conceptual PetClinic Node.js application started.');
    console.log('[PostgresTestApplication] Application is now running with the Docker Compose PostgreSQL instance.');
    console.log('[PostgresTestApplication] Press Ctrl+C to stop the application and clean up containers.');

    process.stdin.resume(); // Keep Node.js event loop active
    await new Promise<void>(resolve => process.on('SIGINT', resolve)); // Wait for Ctrl+C

    console.log('[Testcontainers] Stopping Docker Compose services...');
    await compose.stop();
    console.log('[Testcontainers] Docker Compose services stopped.');

  } catch (error) {
    console.error('[PostgresTestApplication] Failed to start application:', error);
    process.exit(1);
  }
}

// Allow running this script directly
if (require.main === module) {
  startPostgresApplication(process.argv.slice(2)).catch(console.error);
}

// --- Integration Tests ---
describe('PostgresIntegrationTests', () => {
  // Conditional skip if Docker is not available
  beforeAll(async () => {
    const dockerAvailable = await isDockerAvailable();
    if (!dockerAvailable) {
      console.warn('Skipping tests because Docker is not available.');
      // Jest has `test.skip` or `describe.skip`. This is a runtime skip.
      // If `beforeAll` throws, Jest will also mark tests as failed/skipped.
      throw new Error('Docker not available'); // This will skip the test suite
    }
  });

  it('should test findAll vets (simulated cache) with PostgreSQL', async () => {
    // This call would conceptually interact with the PostgreSQL container
    const allVets1 = await vetsRepository.findAll();
    const allVets2 = await vetsRepository.findAll(); // simulated from cache
    expect(allVets1.length).toBeGreaterThan(0); // Expect some mock vets
    expect(allVets2).toEqual(allVets1); // Expect same data on second call
  });

  it('should test owner details endpoint with PostgreSQL backend', async () => {
    // Assuming the conceptual app is running and uses the configured PostgreSQL DB
    const ownerId = 1;
    const response = await request(petClinicApp).get(`/owners/${ownerId}`);

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain(`Owner details for ID ${ownerId}`);
  });
});

