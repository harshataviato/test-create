# PetClinic Node.js - Automated Test Suite

## Installation
1. Install dependencies:
   ```bash
   npm install

## Running Tests
The test suite uses Mocha, Chai, and Supertest. It uses an in-memory or dedicated test SQLite file to ensure isolation.

Run all tests:

## Coverage
- **Models**: Verifies all Sequelize associations (Owner-Pet, Pet-Visit, Vet-Specialty).
- **Controllers**: Verifies logic for finding owners, creating pets, and listing vets.
- **Routes**: Verifies all URL endpoints including error paths.
