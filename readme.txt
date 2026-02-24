PetClinic Test Suite
====================

This directory contains the automated test suite for the Node.js PetClinic application.

Prerequisites
-------------
1. Node.js installed (v16+ recommended).
2. Codebase structure as defined in the project root.

Installation
------------
1. Update `package.json` with the dependencies listed in the provided package.json file.
2. Run installation:
   $ npm install

Running Tests
-------------
To execute the full suite of tests (Unit + Integration):

   $ npm test

This command runs Jest, which looks for files ending in `.test.js` inside the `tests/` directory.

Directory Structure
-------------------
tests/
  ├── setup.js                # Global Jest setup
  ├── helpers/
  │   └── appFactory.js       # Creates Express app instance without listening (for Supertest)
  ├── unit/
  │   └── models.test.js      # Sequelize model validation and relationships
  └── integration/
      ├── general.test.js     # Home, Error handling, 404
      ├── owners.test.js      # Owner CRUD flows
      ├── pets.test.js        # Pet and Visit creation flows
      └── vets.test.js        # Vets HTML and JSON endpoints

Notes
-----
- Tests use an in-memory SQLite database to ensure isolation and speed.
- `appFactory.js` is used to load the Express app logic without starting the server port listener, preventing port conflicts during testing.
- Console logs are suppressed during tests for cleaner output.
