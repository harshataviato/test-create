# PetClinic Node.js Test Instructions

This document outlines the steps to set up the environment and execute the automated test suite for the PetClinic Node.js application.

## Prerequisites

*   **Node.js**: Version 14.x or higher.
*   **NPM**: Installed with Node.js.

## Installation & Setup

1.  **Install Dependencies**
    Install all required packages defined in `package.json`, including the test dependencies (`mocha`, `chai`, `supertest`).

    ```bash
    npm install

    **Expected Output:**
    You should see output indicating the status of each test case.
    
    ```text
    > petclinic-node@1.0.0 test
    > mocha "test/**/*.test.js" --exit --timeout 10000

      Unit Tests: Models
        Owner Model
          ✔ should create a valid owner
          ✔ should fail if telephone is not numeric
          ✔ should fail if telephone is not 10 digits
        Vet Model
          ✔ should create a vet

      Integration Tests: General & Vets
        General Pages
          ✔ GET / should render welcome page
          ✔ GET /oups should trigger error page
        Vet Controller
          ✔ GET /vets.html should render html list
          ✔ GET /vets should return JSON

      Integration Tests: Owner Controller
        GET /owners/find
          ✔ should render the find owners form
        POST /owners/new
          ✔ should create a new owner and redirect
          ✔ should fail validation and re-render form on bad input
        GET /owners (Search)
          ✔ should redirect to owner details if only 1 match found
          ✔ should list multiple owners if multiple matches found
          ✔ should render form with error if no owners found
        GET /owners/:id
          ✔ should show owner details
          ✔ should return 404 for non-existent owner
        POST /owners/:id/edit
          ✔ should update owner details

      Integration Tests: Pet & Visit Controllers
        Pet Operations
          ✔ GET /owners/:id/pets/new should render form
          ✔ POST /owners/:id/pets/new should create a pet
          ✔ POST /owners/:id/pets/new should reject duplicate pet name for same owner
          ✔ POST /owners/:id/pets/:petId/edit should update pet
        Visit Operations
          ✔ GET /owners/*/pets/*/visits/new should render form
          ✔ POST /owners/*/pets/*/visits/new should add a visit
          ✔ should fail if description is empty

      22 passing (1s)
