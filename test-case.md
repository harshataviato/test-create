# Test Execution Instructions

Follow these steps to set up the environment and run the automated test suite.

## 1. Environment Setup
Ensure you have Node.js (v16+) and npm installed on your system.

## 2. Dependency Installation
Install all required production and testing dependencies:

## 3. Database Setup & Migrations
The application uses SQLite. Initialize and seed the default database for manual verification:

## 4. Running the Automated Tests
The tests use an isolated environment. Run the full suite using the following command:

## 5. Running the Server
To run the server manually and explore the UI:
The server will be available at `http://localhost:8080`.

## 6. Functional Verification Points
The test suite validates:
- **Owner Management**: Searching, Creating, and Editing Owners.
- **Pet Management**: Adding and updating pets associated with owners.
- **Visit Records**: Logging visits for specific pets.
- **Vet Information**: Listing veterinarians and their specialties.
- **Error Handling**: Graceful handling of server exceptions via the `/oups` route.
