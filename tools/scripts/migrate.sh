#!/bin/bash
# =============================================================================
# Run database migrations against the local Supabase instance
# =============================================================================
set -e

MIGRATIONS_DIR="packages/db/src/migrations"
DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@localhost:54322/postgres}"

echo "🗄️  Running migrations from $MIGRATIONS_DIR..."

for file in "$MIGRATIONS_DIR"/*.sql; do
  echo "  → $(basename "$file")"
  psql "$DB_URL" -f "$file"
done

echo "✅ Migrations complete"
