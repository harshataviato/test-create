# PetClinic Node.js

A high-performance, cloud-native pet clinic management system built with Node.js, Express, and Sequelize.

## Features
- **OAuth2 Login**: Integrated with Google Auth.
- **Multilingual**: Supports English, German, Spanish, and Russian.
- **Performance**: In-memory caching with performance metrics.
- **Health Monitoring**: Actuator endpoints for system diagnostics.
- **Pluggable DB**: Supports SQLite (default), MySQL, and PostgreSQL.

## Prerequisites
- Node.js (v18+)
- A Google Cloud Project (for OAuth2)

## Environment Setup
1. Create a `.env` file in the root directory:

## Installation

## Running the Application
### Development Mode

### Production Mode

### Docker Deployment

## API and Monitoring
- **Health Check**: `GET /management/health`
- **Cache Metrics**: `GET /management/cache-stats`
- **Vet API (JSON)**: `GET /vets` (Set `Accept: application/json` header)

## Language Switching
Append `?lng=de` or `?lng=ru` to any URL to change the interface language.
