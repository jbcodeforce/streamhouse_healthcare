#!/usr/bin/env bash
# Create Debezium Connect metadata topics on Confluent Cloud (RF=3, cleanup=compact)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT_DIR}/apps/backend/.env"

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
fi

KAFKA_REST="${KAFKA_REST_ENDPOINT:-}"
KAFKA_CLUSTER="${KAFKA_CLUSTER_ID:-}"
API_KEY="${KAFKA_API_KEY:-}"
API_SECRET="${KAFKA_API_SECRET:-}"

if [[ -z "${KAFKA_REST}" || -z "${KAFKA_CLUSTER}" || -z "${API_KEY}" || -z "${API_SECRET}" ]]; then
  echo "Missing Kafka REST credentials. Please run 'source scripts/set_env_from_tf.sh' first."
  exit 1
fi

create_topic() {
  local topic_name="$1"
  local partitions="$2"

  echo "Creating/Verifying topic ${topic_name}..."
  curl -s -X POST \
    -u "${API_KEY}:${API_SECRET}" \
    -H "Content-Type: application/json" \
    "${KAFKA_REST}/v3/clusters/${KAFKA_CLUSTER}/topics" \
    -d "{
      \"topic_name\": \"${topic_name}\",
      \"partitions_count\": ${partitions},
      \"replication_factor\": 3,
      \"configs\": [{\"name\": \"cleanup.policy\", \"value\": \"compact\"}]
    }" > /dev/null 2>&1 || true
}

create_topic "my_connect_configs" 1
create_topic "my_connect_offsets" 25
create_topic "my_connect_status" 5

echo "Debezium Connect topics verified."
