#!/bin/bash

# Navigate to the project directory
cd /tmp/tmpxgqblsgk/

echo "--- Installing dependencies ---"
# Install all project dependencies, including devDependencies for testing
npm install
if [ $? -ne 0 ]; then
  echo "Error: Dependency installation failed."
  exit 1
fi
echo "Dependencies installed successfully."

echo "--- Running tests ---"
# Execute the test suite using the 'test' script defined in package.json
# The 'test' script uses Jest with --detectOpenHandles and --forceExit
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed."
  exit 1
else
  echo "All tests passed successfully."
fi

exit 0
