# PetClinic Node.js Application

This is a Node.js implementation of the Spring PetClinic application, utilizing Express.js, EJS for templating, and Sequelize with PostgreSQL for data persistence.

## Table of Contents

1.  [Prerequisites](#prerequisites)
2.  [Environment Setup](#environment-setup)
3.  [Dependency Installation](#dependency-installation)
4.  [Database Setup and Migrations](#database-setup-and-migrations)
5.  [Running the Server](#running-the-server)
6.  [Running with Docker Compose](#running-with-docker-compose)
7.  [Kubernetes Deployment](#kubernetes-deployment)

---

## 1. Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: Version 18.x or higher. You can download it from [nodejs.org](https://nodejs.org/).
*   **npm**: Node.js package manager, usually comes with Node.js installation.
*   **PostgreSQL**: A running PostgreSQL server instance, or Docker for easy setup.
*   **Docker and Docker Compose**: (Optional, but recommended for easy database setup)
    *   [Docker Desktop](https://www.docker.com/products/docker-desktop)
*   **kubectl**: (Optional, for Kubernetes deployment)
    *   [Install kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)

---

## 2. Environment Setup

The application uses environment variables for configuration (e.g., database credentials). Create a `.env` file in the root directory of the project:


If you are using Docker Compose, the `docker-compose.yml` file will manage these variables for the database service.

---

## 3. Dependency Installation

Navigate to the project's root directory and install the Node.js dependencies:


---

## 4. Database Setup and Migrations

The application uses Sequelize for database interactions. The schema and initial data are loaded directly from SQL files.

**Option 1: Using Docker Compose (Recommended for quick setup)**

This will start a PostgreSQL container and the Node.js application, automatically setting up the database.

The database schema and initial data will be loaded automatically by the `init-db.sh` script when the `node-app` container starts for the first time.

**Option 2: Manual Database Setup (if not using Docker Compose)**

1.  **Create a PostgreSQL Database and User:**
    Connect to your PostgreSQL server (e.g., using `psql` or a GUI tool) and execute the following commands:

    ```sql
    CREATE DATABASE petclinic;
    CREATE USER petclinic WITH PASSWORD 'petclinic';
    GRANT ALL PRIVILEGES ON DATABASE petclinic TO petclinic;
    Replace `${DB_HOST}`, `${DB_PORT}`, `${DB_USER}`, `${DB_NAME}` with your database details.

---

## 5. Running the Server

To start the Node.js application locally:


The application will be accessible at `http://localhost:8080`.

---

## 6. Running with Docker Compose

Ensure Docker is running on your machine.

1.  **Build and Run the Services:**

    ```bash
    docker-compose up --build

---

## 7. Kubernetes Deployment

The provided `k8s/` directory contains Kubernetes manifests for deploying the application.

1.  **Ensure a Kubernetes Cluster is Running:**
    You can use Minikube, Kind, or a cloud-based Kubernetes service.

2.  **Build and Push Docker Image (if not already pushed to a registry):**
    You need to build your Node.js application's Docker image and push it to a registry that your Kubernetes cluster can access. Replace `your-docker-registry` and `your-namespace` with your actual registry and namespace.

    ```bash
    docker build -t your-docker-registry/your-namespace/petclinic-node:latest .
    docker push your-docker-registry/your-namespace/petclinic-node:latest

4.  **Deploy the PetClinic Application:**

    ```bash
    kubectl apply -f k8s/petclinic.yml
    If using `NodePort`, you can access it via `http://<NodeIP>:<NodePort>`. If using `LoadBalancer` (common in cloud environments), an external IP will be assigned.

6.  **Clean up Deployment:**

    ```bash
    kubectl delete -f k8s/petclinic.yml
    kubectl delete -f k8s/db.yml

