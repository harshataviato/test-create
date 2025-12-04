// This is a SQL script for MySQL, defining the `petclinic` database, setting its character set,
// and creating a database user 'petclinic' with a password 'petclinic' and granting it all privileges
// on the `petclinic` database. `FLUSH PRIVILEGES` reloads the grant tables.
//
// This is not Java code and cannot be converted to TypeScript directly.
// In a Node.js/TypeScript environment, database provisioning (creating databases and users)
// is typically handled by:
// - **Infrastructure as Code (IaC) tools**: Tools like Terraform, Pulumi, Ansible, or cloud-specific CLIs
//   (e.g., `gcloud sql databases create`, `aws rds create-db-instance`) are used to manage database instances,
//   databases, and users in a cloud or on-premise environment.
// - **Docker Compose**: For local development, Docker Compose files (like `docker-compose.yml` in this project)
//   can define database services with initial users and databases.
// - **Custom Node.js scripts**: For highly specific or automated setups, you could write a Node.js script
//   using a MySQL client library (`mysql2`) to connect as a superuser and execute these commands.
//   However, this is less common for full provisioning compared to IaC or Docker Compose.

CREATE DATABASE IF NOT EXISTS petclinic;

ALTER DATABASE petclinic
  DEFAULT CHARACTER SET utf8
  DEFAULT COLLATE utf8_general_ci;

CREATE USER IF NOT EXISTS 'petclinic'@'%' IDENTIFIED BY 'petclinic';

GRANT ALL PRIVILEGES ON petclinic.* TO 'petclinic'@'%';

FLUSH PRIVILEGES;

