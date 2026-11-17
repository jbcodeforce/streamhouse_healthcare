#!/usr/bin/env bash
# Start the Streamhouse Healthcare Demo (Backend + Frontend + Optional CDC)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/apps/backend"
FRONTEND_DIR="${ROOT_DIR}/apps/frontend"
ENV_FILE="${BACKEND_DIR}/.env"

START_CDC=false
CHECK_ONLY=false
NO_FRONTEND=false
NO_BACKEND=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --cdc)
      START_CDC=true
      shift
      ;;
    --check)
      CHECK_ONLY=true
      shift
      ;;
    --no-frontend)
      NO_FRONTEND=true
      shift
      ;;
    --no-backend)
      NO_BACKEND=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [[ -f "${ENV_FILE}" ]]; then
  echo "Loading environment from ${ENV_FILE}..."
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
fi

echo "====================================================="
echo "Streamhouse Healthcare Demo Environment Check"
echo "====================================================="
echo "DATABASE_URL:           ${DATABASE_URL:-not set}"
echo "KAFKA_BOOTSTRAP_SERVERS:${KAFKA_BOOTSTRAP_SERVERS:-not set}"
echo "SCHEMA_REGISTRY_URL:    ${SCHEMA_REGISTRY_URL:-not set}"
echo "FLINK_DATABASE:         ${FLINK_DATABASE:-not set}"
echo "FLINK_SNAPSHOT_POOL:    ${FLINK_SNAPSHOT_COMPUTE_POOL_ID:-not set}"
echo "CONFLUENT_GLOBAL_KEY:   ${CONFLUENT_GLOBAL_KEY:+[Configured]}"
echo "====================================================="

if [[ "${CHECK_ONLY}" == "true" ]]; then
  echo "Check completed."
  exit 0
fi

if [[ "${START_CDC}" == "true" ]]; then
  echo "Starting PostgreSQL and Debezium CDC..."
  "${ROOT_DIR}/IaC/local/start_local_pg_server.sh" --seed
  "${ROOT_DIR}/IaC/local/start_debezium.sh"
fi

PIDS=()
cleanup() {
  echo "Stopping development services..."
  for pid in "${PIDS[@]}"; do
    kill "${pid}" 2>/dev/null || true
  done
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

if [[ "${NO_BACKEND}" != "true" ]]; then
  echo "Starting FastAPI Backend on http://127.0.0.1:8000..."
  (cd "${BACKEND_DIR}" && uv run uvicorn main:app --host 127.0.0.1 --port 8000 --reload) &
  PIDS+=($!)
fi

if [[ "${NO_FRONTEND}" != "true" ]]; then
  echo "Starting React Frontend on http://127.0.0.1:5173..."
  (cd "${FRONTEND_DIR}" && npm run dev -- --host 127.0.0.1 --port 5173) &
  PIDS+=($!)
fi

wait
