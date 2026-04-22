# Test Execution Instructions

Follow these steps to set up the environment and execute the automated test suite.

## 1. Environment Setup
Ensure Node.js (v14 or higher) and npm are installed on your system.

## 2. Dependency Installation
Install all required project and testing dependencies:

## 3. Database Setup & Migrations
The application uses SQLite, which requires no external server setup. The following command will initialize the local `petclinic.sqlite` file and populate it with seed data:

## 4. Running the Application
To verify the application manually:
The server will start on port 8080.

## 5. Running Automated Tests
Execute the full test suite (Models and Routes) using the pre-configured script:

The test runner will:
- Initialize an in-memory or separate test database.
- Execute model validation and association tests.
- Execute route integration tests covering success and failure scenarios.
- Provide a summary of passed/failed assertions.
