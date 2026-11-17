#!/usr/bin/env bash
# Stop all local development servers and containers
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Stopping local containers..."
"${ROOT_DIR}/IaC/local/start_debezium.sh" --stop 2>/dev/null || true
"${ROOT_DIR}/IaC/local/start_local_pg_server.sh" --stop 2>/dev/null || true

echo "Killing any background uvicorn or vite processes..."
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

echo "All development services stopped."
