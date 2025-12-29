#!/bin/bash
# Database initialization script
# This script runs automatically when the PostgreSQL container starts for the first time

set -e

echo "Initializing Municipal NFT database..."

# The database is already created by POSTGRES_DB environment variable
# This script can be used for additional initialization tasks

echo "Database initialization completed successfully!"
