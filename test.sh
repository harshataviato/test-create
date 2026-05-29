#!/bin/bash

# Navigate to the project root directory
# The codebase is specified to be in /tmp/tmpc4dw_b02/
echo "Navigating to /tmp/tmpc4dw_b02/"
cd /tmp/tmpc4dw_b02/

# Check if the directory change was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to change directory to /tmp/tmpc4dw_b02/. Please ensure the codebase is at this path."
  exit 1
fi

# Step 1: Install Node.js dependencies
# This command reads the package.json file and installs all listed
# 'dependencies' and 'devDependencies'. This includes Express, EJS,
# SQLite3, method-override, express-ejs-layouts, and test utilities like Mocha, Chai, Sinon, and Supertest.
echo "Installing Node.js dependencies..."
npm install

# Check if npm install was successful. If not, exit with an error.
if [ $? -ne 0 ]; then
  echo "Error: npm install failed. Please ensure Node.js and npm are installed and try again."
  exit 1
fi

# Step 2: Database Setup for Testing
# The application's test suite is configured to manage its own database lifecycle.
# In the 'test' environment (set by 'NODE_ENV=test' in the npm script),
# the 'config/db.js' module ensures a dedicated 'test_tasks.db' is created,
# its schema is initialized (using 'db/init.sql'), and then it's deleted
# after all tests complete. Therefore, a separate 'db:init' command is not
# required before running tests; the test setup handles it automatically.

# Step 3: Execute the Test Suite
# This command runs the 'test' script defined in package.json.
# It sets NODE_ENV to 'test', which tells the database configuration to use
# 'test_tasks.db'. It then executes all Mocha test files recursively within
# the 'test/' directory.
echo "Running the automated test suite..."
npm test

# Report test results
if [ $? -ne 0 ]; then
  echo "Error: Test suite failed. Please review the output above for failures."
  exit 1
else
  echo "Success: All test cases passed!"
  exit 0
fi
