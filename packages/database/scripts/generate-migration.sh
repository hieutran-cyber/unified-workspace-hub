#!/bin/bash

# Script to generate a Prisma migration in a non-interactive environment
# Usage: ./generate-migration.sh <migration_name>

MIGRATION_NAME=$1

if [ -z "$MIGRATION_NAME" ]; then
  echo "Error: Migration name is required."
  echo "Usage: ./generate-migration.sh <migration_name>"
  exit 1
fi

# Configuration
SHADOW_DATABASE_URL="postgresql://admin:password@localhost:5432/workspace_shadow?schema=public"
MIGRATIONS_DIR="prisma/migrations"
SCHEMA_FILE="prisma/schema.prisma"

# Ensure we are in the database package directory if running via script directly
# but we'll assume it's run from the package root.

TIMESTAMP=$(date +%Y%m%d%H%M%S)
DIR_NAME="${TIMESTAMP}_${MIGRATION_NAME}"
TARGET_DIR="${MIGRATIONS_DIR}/${DIR_NAME}"

echo "Generating migration: ${MIGRATION_NAME}..."

# 1. Create the migration directory
mkdir -p "$TARGET_DIR"

# 2. Generate the SQL diff using the shadow database
# We compare the current migration history (on disk) with the current schema file
npx prisma migrate diff \
  --from-migrations "$MIGRATIONS_DIR" \
  --to-schema-datamodel "$SCHEMA_FILE" \
  --shadow-database-url "$SHADOW_DATABASE_URL" \
  --script > "${TARGET_DIR}/migration.sql"

if [ $? -eq 0 ]; then
  echo "✅ Migration SQL generated at: ${TARGET_DIR}/migration.sql"
  
  # 3. Optional: Mark it as applied in the main DB (since we usually do this in dev)
  # But we'll let the user decide or run migrate deploy.
  echo "Next step: Run 'npx prisma migrate resolve --applied ${DIR_NAME}' to mark it as applied if your DB is already in sync."
else
  echo "❌ Failed to generate migration SQL."
  rm -rf "$TARGET_DIR"
  exit 1
fi
