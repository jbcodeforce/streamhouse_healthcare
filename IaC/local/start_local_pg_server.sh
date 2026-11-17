#!/usr/bin/env bash
# Start local PostgreSQL 17 server with wal_level=logical for CDC
set -euo pipefail

CONTAINER_NAME="healthcare-postgres"
PG_USER="${PG_USER:-dbadmin}"
PG_PASSWORD="${PG_PASSWORD:-localdevonly}"
PG_DB="${PG_DB:-healthcaredb}"
PG_PORT="${PG_PORT:-5432}"

CONTAINER_CMD="container"
if ! command -v container &> /dev/null; then
  CONTAINER_CMD="docker"
fi

case "${1:-start}" in
  --stop)
    echo "Stopping ${CONTAINER_NAME}..."
    $CONTAINER_CMD stop "${CONTAINER_NAME}" 2>/dev/null || true
    $CONTAINER_CMD rm "${CONTAINER_NAME}" 2>/dev/null || true
    echo "${CONTAINER_NAME} stopped."
    exit 0
    ;;
  --reset)
    echo "Resetting ${CONTAINER_NAME}..."
    $CONTAINER_CMD stop "${CONTAINER_NAME}" 2>/dev/null || true
    $CONTAINER_CMD rm "${CONTAINER_NAME}" 2>/dev/null || true
    ;;
esac

# Check if running
if $CONTAINER_CMD ps --format '{{.Names}}' 2>/dev/null | grep -q "^${CONTAINER_NAME}$"; then
  echo "PostgreSQL container ${CONTAINER_NAME} is already running on port ${PG_PORT}."
else
  # Remove stopped container if exists
  $CONTAINER_CMD rm "${CONTAINER_NAME}" 2>/dev/null || true

  echo "Starting PostgreSQL 17 container (${CONTAINER_NAME})..."
  $CONTAINER_CMD run -d \
    --name "${CONTAINER_NAME}" \
    -e POSTGRES_USER="${PG_USER}" \
    -e POSTGRES_PASSWORD="${PG_PASSWORD}" \
    -e POSTGRES_DB="${PG_DB}" \
    -p "${PG_PORT}:5432" \
    postgres:17-alpine \
    postgres -c wal_level=logical -c max_wal_senders=10 -c max_replication_slots=10

  echo "Waiting for PostgreSQL to accept connections..."
  for i in {1..30}; do
    if $CONTAINER_CMD exec "${CONTAINER_NAME}" pg_isready -U "${PG_USER}" -d "${PG_DB}" >/dev/null 2>&1; then
      echo "PostgreSQL is ready!"
      break
    fi
    sleep 1
  done
fi

if [[ "${1:-}" == "--seed" || "${2:-}" == "--seed" ]]; then
  echo "Seeding database schema and initial records via backend bootstrap..."
  ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
  export DATABASE_URL="postgresql://${PG_USER}:${PG_PASSWORD}@localhost:${PG_PORT}/${PG_DB}?sslmode=prefer"
  (cd "${ROOT_DIR}/apps/backend" && uv run python bootstrap.py)
fi
