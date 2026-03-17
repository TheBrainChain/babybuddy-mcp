#!/usr/bin/env bash
# Downloads the latest Baby Buddy OpenAPI schema from the upstream repository.
set -euo pipefail

SCHEMA_URL="https://raw.githubusercontent.com/babybuddy/babybuddy/master/openapi-schema.yml"
OUT="$(dirname "$0")/../openapi-schema.yml"

echo "Fetching OpenAPI schema from $SCHEMA_URL ..."
curl -fsSL "$SCHEMA_URL" -o "$OUT"
echo "Saved to $OUT"
