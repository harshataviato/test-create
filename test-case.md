# Test Case Execution Guide

This document provides detailed instructions for setting up the environment, installing dependencies, and running the automated test suite for the "Hello World" Node.js application.

## 1. Environment Setup

*   **Node.js:** Ensure that Node.js is installed on your system.
    *   **Recommended Version:** Node.js 14.x or newer.
    *   You can download Node.js from its official website: [nodejs.org](https://nodejs.org/).
    *   **Verify Installation:** Open your terminal or command prompt and run:
        ```bash
        node -v
        npm -v

2.  **Modify `package.json`:**
    You need to update the `package.json` file to include `jest` as a development dependency and to configure the `test` script.
    *   Open `package.json` in a text editor.
    *   Locate the `"scripts"` section and change the `"test"` entry from `"echo \"Error: no test specified\" && exit 1"` to `"jest"`.
    *   Add a `"devDependencies"` section if it doesn't exist, and add `"jest": "^27.0.0"` (or a suitable recent version) within it.

    **Example `package.json` snippet after modification:**
    ```json
    {
      "name": "hello-world-node",
      "version": "1.0.0",
      // ... other fields ...
      "scripts": {
        "start": "node src/app.js",
        "test": "jest"
      },
      // ... other fields ...
      "devDependencies": {
        "jest": "^27.0.0"
      }
    }
    This command will download and install Jest and any other declared dependencies.

## 3. Database Setup & Migrations

**Not Applicable:** This "Hello World" application is a simple console utility and does not interact with any database. Therefore, no database setup, configuration, or migration steps are required for this project.

## 4. Running the Application

To execute the main application and observe its expected output:


**Expected Console Output:**

## 5. Running the Test Cases

To execute the automated test suite and verify the correctness of the application's components:


**Expected Test Output:**
Jest will run all test files (e.g., `tests/*.test.js`) and provide a summary of the test results. You should see output similar to the following, indicating all tests have passed:


The test suite covers:
*   **`greetingModel.test.js`**: Verifies that the `getGreeting` function correctly returns the expected "Hello world!" message.
*   **`consoleView.test.js`**: Confirms that the `render` function correctly utilizes `console.log` to display messages.
*   **`greetingController.test.js`**: Ensures the `displayGreeting` controller method properly orchestrates calls to the model (`getGreeting`) and the view (`render`), passing the correct data between them.
*   **`app.test.js`**: Validates the main application's entry point, verifying that it logs startup/shutdown messages and correctly invokes the `greetingController.displayGreeting` method.
