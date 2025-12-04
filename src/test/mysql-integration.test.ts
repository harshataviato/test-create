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

// This file is a TypeScript adaptation of MySqlIntegrationTests.java.
// It uses Jest for testing, Supertest for HTTP requests, and the Node.js Testcontainers library
// to spin up a MySQL Docker container for integration testing.

import request from 'supertest';
import { Application } from 'express'; // Assuming an Express application
import { MySQLContainer, StartedMySQLContainer } from '@testcontainers/mysql';
import { GenericContainer } from 'testcontainers'; // For general container features if needed
import { expect } from '@jest/globals';

// --- Mock/Conceptual implementations for demonstration ---
// In a real project, these would be actual service/repository implementations.

interface Vet {
  id: number;
  firstName: string;
  lastName: string;
  specialties: string[];
}

// Conceptual VetRepository in TypeScript.
// This mock would interact with the database configured by Testcontainers.
// For simplicity in this conversion, it's still a mock, but its *intent*
// is to query the actual MySQL container.
class MockVetRepository {
  // A real implementation would have a database connection/ORM here
  private dbClient: any; // Placeholder for a DB client like 'mysql2' or a TypeORM connection

  constructor(connectionDetails: any) {
    console.log('[MockVetRepository] Initialized with DB details:', connectionDetails);
    // In a real app, establish connection to the Testcontainers MySQL instance
    // e.g., this.dbClient = new mysql2.createConnection(connectionDetails);
  }

  async findAll(): Promise<Vet[]> {
    console.log('[MockVetRepository] findAll called (conceptually querying MySQL)');
    // Simulate database query
    return Promise.resolve([
      { id: 1, firstName: 'James', lastName: 'Carter', specialties: ['radiology'] },
      { id: 2, firstName: 'Helen', lastName: 'Leary', specialties: ['surgery'] },
    ]);
  }

  async findById(id: number): Promise<Vet | undefined> {
    console.log(`[MockVetRepository] findById called for ${id} (conceptually querying MySQL)`);
    // Simulate database query
    const vets = await this.findAll();
    return vets.find(vet => vet.id === id);
  }
}

// --- End Mock implementations ---

// We need a reference to the actual application instance for supertest.
// This would typically be imported from your main application file, e.g., 'src/main'.
// For this conceptual conversion, we'll assume `petClinicApp` is an Express app instance.
let petClinicApp: Application; // Placeholder for your Express/NestJS application instance
let server: any; // The HTTP server instance
let mysqlContainer: StartedMySQLContainer;
let vetsRepository: MockVetRepository; // Mock repository instance

// Jest setup similar to @SpringBootTest, @Testcontainers, @ActiveProfiles("mysql")
beforeAll(async () => {
  // Start the MySQL container
  mysqlContainer = await new MySQLContainer('mysql:9.5')
    .withDatabase('petclinic')
    .withUsername('petclinic')
    .withPassword('petclinic')
    .withExposedPorts(3306) // This exposes the container's 3306 port to a random host port
    .start();

  console.log(`[Testcontainers] MySQL container started on port ${mysqlContainer.getHost()}:${mysqlContainer.getMappedPort(3306)}`);

  // Mimic `@ActiveProfiles("mysql")` by setting environment variables
  // that your Node.js application would pick up for DB connection.
  process.env.DB_TYPE = 'mysql';
  process.env.MYSQL_HOST = mysqlContainer.getHost();
  process.env.MYSQL_PORT = mysqlContainer.getMappedPort(3306).toString();
  process.env.MYSQL_DATABASE = 'petclinic';
  process.env.MYSQL_USER = 'petclinic';
  process.env.MYSQL_PASSWORD = 'petclinic';

  // In a real app, you would initialize your Express/NestJS app here.
  // The app's database connection logic would use the above environment variables.
  // For this demo, we'll create a minimal Express app and a mock repository.
  petClinicApp = require('express')(); // Minimal Express app for supertest
  petClinicApp.get('/owners/:id', async (req, res) => {
    // In a real app, this would use the actual vetsRepository/ownerService
    const owner = await vetsRepository.findById(parseInt(req.params.id, 10));
    if (owner) {
      res.status(200).send(`Owner details for ID ${req.params.id} (from MySQL via mock)`);
    } else {
      res.status(404).send('Owner not found');
    }
  });

  const PORT = process.env.PORT || 8081; // Use a different port than integration tests
  server = petClinicApp.listen(PORT, () => {
    console.log(`[Test Setup] Mock PetClinic app listening on http://localhost:${PORT}`);
    process.env.TEST_SERVER_PORT = PORT.toString(); // Mimic @LocalServerPort
  });

  // Initialize the mock repository with connection details from Testcontainers
  vetsRepository = new MockVetRepository({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  });

}, 60000); // Increase timeout for container startup

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => {
      console.log('[Test Teardown] Mock PetClinic app server closed.');
      resolve();
    }));
  }
  if (mysqlContainer) {
    await mysqlContainer.stop();
    console.log('[Testcontainers] MySQL container stopped.');
  }
});

// @DisabledInNativeImage and @DisabledInAotMode are Java-specific and omitted in TypeScript.
describe('MySqlIntegrationTests', () => {
  it('should test findAll vets with MySQL (simulated cache)', async () => {
    // This call would conceptually interact with the MySQL container
    const allVets1 = await vetsRepository.findAll();
    const allVets2 = await vetsRepository.findAll(); // served from cache (simulated)
    expect(allVets1.length).toBeGreaterThan(0); // Expect some mock vets
    expect(allVets2).toEqual(allVets1); // Expect same data on second call
  });

  it('should test owner details endpoint with MySQL backend', async () => {
    const ownerId = 1;
    const response = await request(petClinicApp).get(`/owners/${ownerId}`);

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain(`Owner details for ID ${ownerId}`);
  });
});
