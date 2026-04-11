#!/bin/bash
# =============================================================================
# Generate TypeScript types from Supabase schema
# =============================================================================
set -e

echo "🔄 Generating Supabase TypeScript types..."

# Check if supabase CLI is installed
command -v supabase >/dev/null 2>&1 || {
  echo "❌ Supabase CLI not found"
  echo "   Install: npm install -g supabase"
  exit 1
}

OUTPUT="packages/types/src/supabase.ts"

supabase gen types typescript --local > "$OUTPUT"
echo "✓ Types written to $OUTPUT"
