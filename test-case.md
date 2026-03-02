# Test Execution Guide

This document provides instructions on setting up the environment and running the automated test suite for the Node.js PetClinic application.

## 1. Environment Setup

Ensure you have Node.js (v16 or higher) installed on your system.

## 2. Dependency Installation

Install all project dependencies, including the testing framework:


## 3. Database Setup (Development/Manual Testing)

If you wish to manually test the application before running automated tests:


## 4. Running the Server

To start the application locally:

The application will be available at `http://localhost:8080`.

## 5. Running Automated Tests

The test suite uses `Jest` and `Supertest`. It uses an in-memory SQLite database (`:memory:`) to ensure test isolation and speed.

Run all tests:


To run tests with a coverage report:


## 6. Test Scenarios Covered

### Model Tests
- **Validation**: Checks that Owner telephone numbers must be exactly 10 digits and numeric.
- **Associations**: Verifies that Owners have Pets, Pets have Visits and Types, and Vets have Specialties.

### Route Tests
- **Welcome**: Verifies the home page loads.
- **Vets**: Verifies both HTML listing and JSON API response.
- **Owners**:
    - Searching for owners (exact match, partial match, and no match).
    - Creation of owners with valid and invalid data.
    - Retrieval of owner details.
- **Pets & Visits**:
    - Adding a new pet to an existing owner.
    - Recording a visit for a pet.
- **Error Handling**: Verifies the application correctly renders a 500 error page when an exception occurs.
