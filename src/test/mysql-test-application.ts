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

// This file is a TypeScript adaptation of MysqlTestApplication.java.
// In a Node.js/TypeScript ecosystem, this would represent a utility or script
// to launch the main application (e.g., an Express or NestJS app)
// with specific configurations, primarily integrating with a Testcontainers-managed MySQL database.
// It's not a test file itself but an application runner for a test scenario.

import { MySQLContainer, StartedMySQLContainer } from '@testcontainers/mysql';
// In a real application, you would import your main application bootstrap function.
// For this example, we'll use a placeholder.
// import { startApplication } from '../../main/app'; // e.g., your main app entry point

/**
 * Conceptual PetClinic Node.js Application Runner for MySQL.
 * This function demonstrates how you would start your Node.js application
 * with a Testcontainers-managed MySQL database, mimicking the Java `main` method.
 *
 * @param args Command-line arguments. In Java, these would set Spring profiles and Docker Compose flags.
 *             In Node.js, these could directly influence environment variables or configuration.
 */
export async function startMysqlTestApplication(args: string[] = []): Promise<void> {
  console.log('[MysqlTestApplication] Starting PetClinic Node.js application with MySQL Testcontainer...');

  let mysqlContainer: StartedMySQLContainer | undefined;
  try {
    // Mimic @ServiceConnection and @Bean for MySQLContainer
    // This starts a MySQL Docker container.
    mysqlContainer = await new MySQLContainer('mysql:9.5')
      .withDatabase('petclinic')
      .withUsername('petclinic')
      .withPassword('petclinic')
      .withExposedPorts(3306)
      .start();

    console.log(`[Testcontainers] MySQL container started on: ${mysqlContainer.getHost()}:${mysqlContainer.getMappedPort(3306)}`);

    // Mimic "--spring.profiles.active=mysql" by setting environment variables
    // that your Node.js application would use for database connection.
    process.env.DB_TYPE = 'mysql';
    process.env.MYSQL_HOST = mysqlContainer.getHost();
    process.env.MYSQL_PORT = mysqlContainer.getMappedPort(3306).toString();
    process.env.MYSQL_DATABASE = 'petclinic';
    process.env.MYSQL_USER = 'petclinic';
    process.env.MYSQL_PASSWORD = 'petclinic';

    // The original Java `main` method also disables `spring.docker.compose.enabled=false`.
    // In Node.js, if you had a similar Docker Compose integration, you'd disable it here.
    // For this conceptual example, we just acknowledge it.

    // --- Conceptual application startup ---
    // This is where you would call your main application's bootstrap function.
    // For example:
    // await startApplication({
    //   profile: 'mysql', // Pass a conceptual profile
    //   disableDockerCompose: true,
    //   ...parseArgs(args), // Parse additional args if any
    // });
    console.log('[MysqlTestApplication] Conceptual PetClinic Node.js application started.');
    console.log('[MysqlTestApplication] Application is now running with the Testcontainers MySQL instance.');
    console.log('[MysqlTestApplication] Press Ctrl+C to stop the application and clean up the container.');

    // Keep the process alive. In a real scenario, `startApplication` might block
    // or you'd use a mechanism like `process.stdin.resume()` for simple scripts.
    // For a development server, it would stay alive until stopped.
    process.stdin.resume(); // Keep Node.js event loop active
    await new Promise<void>(resolve => process.on('SIGINT', resolve)); // Wait for Ctrl+C

  } catch (error) {
    console.error('[MysqlTestApplication] Failed to start application:', error);
    process.exit(1);
  } finally {
    // Ensure container is stopped on exit or error
    if (mysqlContainer) {
      console.log('[Testcontainers] Stopping MySQL container...');
      await mysqlContainer.stop();
      console.log('[Testcontainers] MySQL container stopped.');
    }
    console.log('[MysqlTestApplication] Application stopped.');
  }
}

// Allow running this script directly
if (require.main === module) {
  startMysqlTestApplication(process.argv.slice(2)).catch(console.error);
}
