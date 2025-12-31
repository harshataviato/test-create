# PetClinic Node.js Application

This is a Node.js implementation of the classic PetClinic application, demonstrating various features like owner and pet management, veterinarian listings with caching, multi-language support, and containerized deployment.

## Features

*   **Owner Management**: Create, search, view, and update owner profiles.
*   **Pet Management**: Add/modify pets associated with owners.
*   **Visit Management**: Record and view pet visits.
*   **Veterinarian Listing**: Display a paginated list of vets with specialties, utilizing caching.
*   **Multi-Database Support**: Configured for SQLite (default for development), MySQL, and PostgreSQL.
*   **Internationalization (i18n)**: User interface supports English and Spanish.
*   **Data Validation**: Robust input validation for owner, pet, and visit data.
*   **Error Handling**: Demonstrates a dedicated error page for runtime exceptions.
*   **Caching**: In-memory caching for veterinarian data to improve performance.
*   **Containerized Database Deployment**: `docker-compose.yml` for local database setup.
*   **Kubernetes Deployment Configuration**: `k8s/*.yml` manifests for cloud-native deployment.

## Technologies Used

*   **Backend**: Node.js with Express.js
*   **Database**: Sequelize ORM (supporting SQLite, MySQL, PostgreSQL)
*   **Templating**: EJS
*   **Internationalization**: `i18n-node`
*   **Validation**: `express-validator`
*   **Caching**: `node-cache`
*   **Containerization**: Docker, Docker Compose
*   **Orchestration**: Kubernetes

---

## Getting Started

Follow these steps to set up and run the PetClinic application locally.

### 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

*   [Node.js](https://nodejs.org/en/download/) (LTS version recommended)
*   [npm](https://www.npmjs.com/get-npm) (comes with Node.js) or [Yarn](https://yarnpkg.com/getting-started/install)
*   [Docker](https://www.docker.com/get-started) (for containerized database deployment)
*   [Docker Compose](https://docs.docker.com/compose/install/) (comes with Docker Desktop)

### 2. Project Setup

1.  **Clone the repository:**
    ```bash
    # Assuming you have cloned/downloaded the project, navigate into its root directory
    cd petclinic-nodejs

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory of the project by copying `.env.example`:
    ```bash
    cp .env.example .env
    PORT=8080
    DB_DIALECT=sqlite
    SQLITE_STORAGE=./data/petclinic.sqlite
    CACHE_TTL_SECONDS=3600
    DEFAULT_LOCALE=en
    **For PostgreSQL:**
    ```bash
    docker-compose up -d postgres_db
    DB_DIALECT=mysql
    MYSQL_HOST=localhost
    MYSQL_PORT=3306
    MYSQL_USER=petclinic
    MYSQL_PASSWORD=petclinic
    MYSQL_DATABASE=petclinic
    # ... other settings
    DB_DIALECT=postgres
    POSTGRES_HOST=localhost
    POSTGRES_PORT=5432
    POSTGRES_USER=petclinic
    POSTGRES_PASSWORD=petclinic
    POSTGRES_DATABASE=petclinic
    # ... other settings

2.  **Seed Data:** This populates the tables with some initial demo data.
    ```bash
    npm run db:seed
    # OR
    yarn db:seed
npm run dev
# OR
yarn dev
npm start
# OR
yarn start
    *Remember to replace `your-dockerhub-username` with your actual Docker Hub username.*

2.  **Update Kubernetes Manifests:**
    *   Edit `k8s/petclinic-deployment.yml` and replace `your-dockerhub-username/petclinic-nodejs:latest` with your actual image name.
    *   Review `k8s/petclinic-ingress.yml` and replace `petclinic.example.com` with your desired domain or remove the Ingress if you plan to use a LoadBalancer service directly.
    *   Configure database credentials: Create a Kubernetes secret for your database. The `k8s/petclinic-secret.yml` provides a template.
        ```bash
        # Create the secret. Make sure values are base64 encoded.
        kubectl apply -f k8s/petclinic-secret.yml
    Wait for the PostgreSQL pod to be `Running` and `Ready`. You can check with `kubectl get pods -l app=petclinic-postgres`.

2.  **Deploy the Node.js application:**
    ```bash
    kubectl apply -f k8s/petclinic-deployment.yml
    kubectl apply -f k8s/petclinic-service.yml
    Ensure you have an Ingress controller running in your cluster.

    **If using a LoadBalancer (simpler for testing, public IP):**
    You would modify `k8s/petclinic-service.yml` to change `type: ClusterIP` to `type: LoadBalancer` and then apply it.
    ```bash
    # (Optional) Modify k8s/petclinic-service.yml: change type to LoadBalancer
    # Then apply:
    # kubectl apply -f k8s/petclinic-service.yml
# Example for running migrations:
kubectl run --generator=run-pod/v1 petclinic-migrate \
  --image=your-dockerhub-username/petclinic-nodejs:latest \
  --restart=Never \
  --env="DB_DIALECT=postgres" \
  --env="POSTGRES_HOST=petclinic-postgres-service" \
  --env="POSTGRES_PORT=5432" \
  --env-from=secret/petclinic-db-credentials \
  -- npm run db:migrate

# Example for seeding data:
kubectl run --generator=run-pod/v1 petclinic-seed \
  --image=your-dockerhub-username/petclinic-nodejs:latest \
  --restart=Never \
  --env="DB_DIALECT=postgres" \
  --env="POSTGRES_HOST=petclinic-postgres-service" \
  --env="POSTGRES_PORT=5432" \
  --env-from=secret/petclinic-db-credentials \
  -- npm run db:seed
