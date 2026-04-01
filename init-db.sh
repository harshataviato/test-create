#!/bin/sh

# This script waits for the PostgreSQL database to be ready and then initializes its schema and data.
# It is designed to be run as part of the Docker container startup.

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-petclinic}
DB_PASSWORD=${DB_PASSWORD:-petclinic}
DB_NAME=${DB_NAME:-petclinic}

echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT to be ready..."

# Loop until PostgreSQL is ready
# pg_isready is a utility to check the connection status of a PostgreSQL server.
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - executing database initialization scripts"

# Check if the tables already exist (e.g., 'owners' table)
# If the 'owners' table does not exist, it's a fresh database, so apply schema and data.
# This prevents re-initializing data on container restarts if data is persistent.
OWNERS_TABLE_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='owners'")

if [ "$OWNERS_TABLE_EXISTS" != "1" ]; then
  echo "Owners table not found, initializing database schema and data..."
  # Apply schema.sql
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f /app/src/db/postgres/schema.sql || { echo "Schema initialization failed!"; exit 1; }
  echo "Schema initialized successfully."

  # Apply data.sql
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f /app/src/db/postgres/data.sql || { echo "Data initialization failed!"; exit 1; }
  echo "Data initialized successfully."
else
  echo "Owners table already exists, skipping database initialization."
fi

echo "Database initialization script finished."

# The main application command will be run after this script completes
# (as defined in docker-compose.yml's command field for node-app)
