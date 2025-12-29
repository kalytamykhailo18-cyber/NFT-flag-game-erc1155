#!/bin/sh
set -e

echo "================================================"
echo "Municipal Place NFT - Backend Starting"
echo "================================================"

# Function to wait for postgres
wait_for_postgres() {
  echo "Waiting for PostgreSQL..."
  until wget --quiet --tries=1 --spider "http://${DB_HOST}:${DB_PORT}" 2>/dev/null || \
        nc -z "${DB_HOST}" "${DB_PORT}" 2>/dev/null || \
        pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" 2>/dev/null; do
    echo "  PostgreSQL is unavailable - sleeping"
    sleep 2
  done
  echo "  ✓ PostgreSQL is ready"
}

# Function to validate required environment variables
validate_env() {
  echo "Validating environment variables..."

  REQUIRED_VARS="DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD CONTRACT_ADDRESS ADMIN_PRIVATE_KEY"
  MISSING_VARS=""

  for VAR in $REQUIRED_VARS; do
    eval VALUE=\$$VAR
    if [ -z "$VALUE" ]; then
      MISSING_VARS="$MISSING_VARS $VAR"
    fi
  done

  if [ -n "$MISSING_VARS" ]; then
    echo "  ✗ ERROR: Missing required environment variables:$MISSING_VARS"
    exit 1
  fi

  echo "  ✓ All required environment variables are set"
}

# Function to run database migrations
run_migrations() {
  echo "Running database migrations..."

  if [ ! -d "database/migrations" ]; then
    echo "  ⚠ Warning: database/migrations directory not found, skipping migrations"
    return 0
  fi

  # Check if sequelize-cli is available
  if ! command -v npx >/dev/null 2>&1; then
    echo "  ✗ ERROR: npx not found"
    return 1
  fi

  # Run migrations
  if npx sequelize-cli db:migrate --config database/config/config.js; then
    echo "  ✓ Migrations completed successfully"
  else
    echo "  ✗ ERROR: Migration failed"
    exit 1
  fi
}

# Function to run seeders (only in development)
run_seeders() {
  if [ "$NODE_ENV" = "development" ] && [ "$RUN_SEEDERS" = "true" ]; then
    echo "Running database seeders..."

    if npx sequelize-cli db:seed:all --config database/config/config.js; then
      echo "  ✓ Seeders completed successfully"
    else
      echo "  ⚠ Warning: Seeders failed (non-critical)"
    fi
  fi
}

# Main execution
echo "Environment: ${NODE_ENV:-production}"
echo ""

# Step 1: Validate environment
validate_env

# Step 2: Wait for database
wait_for_postgres

# Step 3: Run migrations
run_migrations

# Step 4: Run seeders (if enabled)
run_seeders

echo ""
echo "================================================"
echo "Starting application..."
echo "================================================"
echo ""

# Execute the main command
exec "$@"
