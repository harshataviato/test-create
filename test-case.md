# Test Setup and Execution Guide

This document outlines the commands required to set up the environment and execute the automated test suite.

## Environment Setup

### 1. Install Dependencies
Install production and development dependencies (Express, EJS, Jest, Supertest):

### 2. Database Setup (Mocked)
Since the current `messageModel.js` uses static data, no external database service (like PostgreSQL/MySQL) is required to be running. The test suite simulates database interactions.

### 3. Verify Directory Structure
Ensure that the tests directory exists:

## Running Tests

### Execute Full Test Suite
Run the following command to execute all unit and integration tests:

### Generate Coverage Report
To verify 100% coverage as requested:

### Manual Verification (Optional)
Start the server to manually inspect the UI:
Then navigate to `http://localhost:3000` in your browser.

## CI/CD Execution Command
For CI systems (like GitHub Actions or Jenkins), use:
