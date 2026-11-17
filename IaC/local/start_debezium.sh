#!/usr/bin/env bash
# Start Debezium Connect worker and configure PostgreSQL CDC connector for healthcaredb
set -euo pipefail

CONTAINER_NAME="healthcare-debezium"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT_DIR}/apps/backend/.env"

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
fi

CONTAINER_CMD="container"
if ! command -v container &> /dev/null; then
  CONTAINER_CMD="docker"
fi

case "${1:-start}" in
  --stop)
    echo "Stopping ${CONTAINER_NAME}..."
    $CONTAINER_CMD stop "${CONTAINER_NAME}" 2>/dev/null || true
    $CONTAINER_CMD rm "${CONTAINER_NAME}" 2>/dev/null || true
    exit 0
    ;;
  --logs)
    $CONTAINER_CMD logs -f "${CONTAINER_NAME}"
    exit 0
    ;;
esac

BOOTSTRAP_SERVERS="${KAFKA_BOOTSTRAP_SERVERS:-}"
KAFKA_KEY="${KAFKA_API_KEY:-}"
KAFKA_SECRET="${KAFKA_API_SECRET:-}"
SR_URL="${SCHEMA_REGISTRY_URL:-}"
SR_KEY="${SCHEMA_REGISTRY_API_KEY:-}"
SR_SECRET="${SCHEMA_REGISTRY_API_SECRET:-}"

if [[ -z "${BOOTSTRAP_SERVERS}" || -z "${KAFKA_KEY}" || -z "${KAFKA_SECRET}" ]]; then
  echo "Missing Confluent Cloud Kafka credentials in environment."
  echo "Run 'source scripts/set_env_from_tf.sh' first."
  exit 1
fi

# Determine host / IP for postgres container
PG_CONTAINER="healthcare-postgres"
PG_HOST="localhost"
if command -v container &> /dev/null; then
  PG_IP=$(container list --format json 2>/dev/null | grep -o '"ip":"[^"]*"' | head -1 | cut -d'"' -f4 || true)
  if [[ -n "${PG_IP}" ]]; then
    PG_HOST="${PG_IP}"
  fi
elif command -v docker &> /dev/null; then
  PG_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "${PG_CONTAINER}" 2>/dev/null || true)
  if [[ -n "${PG_IP}" ]]; then
    PG_HOST="${PG_IP}"
  else
    PG_HOST="host.docker.internal"
  fi
fi

echo "Starting Debezium Connect container pointing to PostgreSQL at ${PG_HOST}:5432..."
$CONTAINER_CMD stop "${CONTAINER_NAME}" 2>/dev/null || true
$CONTAINER_CMD rm "${CONTAINER_NAME}" 2>/dev/null || true

$CONTAINER_CMD run -d \
  --name "${CONTAINER_NAME}" \
  -p 8083:8083 \
  -e GROUP_ID=1 \
  -e CONFIG_STORAGE_TOPIC=my_connect_configs \
  -e OFFSET_STORAGE_TOPIC=my_connect_offsets \
  -e STATUS_STORAGE_TOPIC=my_connect_status \
  -e CONNECT_CONFIG_STORAGE_REPLICATION_FACTOR=3 \
  -e CONNECT_OFFSET_STORAGE_REPLICATION_FACTOR=3 \
  -e CONNECT_STATUS_STORAGE_REPLICATION_FACTOR=3 \
  -e BOOTSTRAP_SERVERS="${BOOTSTRAP_SERVERS}" \
  -e CONNECT_BOOTSTRAP_SERVERS="${BOOTSTRAP_SERVERS}" \
  -e CONNECT_SECURITY_PROTOCOL=SASL_SSL \
  -e CONNECT_SASL_MECHANISM=PLAIN \
  -e CONNECT_SASL_JAAS_CONFIG="org.apache.kafka.common.security.plain.PlainLoginModule required username=\"${KAFKA_KEY}\" password=\"${KAFKA_SECRET}\";" \
  -e CONNECT_PRODUCER_SECURITY_PROTOCOL=SASL_SSL \
  -e CONNECT_PRODUCER_SASL_MECHANISM=PLAIN \
  -e CONNECT_PRODUCER_SASL_JAAS_CONFIG="org.apache.kafka.common.security.plain.PlainLoginModule required username=\"${KAFKA_KEY}\" password=\"${KAFKA_SECRET}\";" \
  -e CONNECT_CONSUMER_SECURITY_PROTOCOL=SASL_SSL \
  -e CONNECT_CONSUMER_SASL_MECHANISM=PLAIN \
  -e CONNECT_CONSUMER_SASL_JAAS_CONFIG="org.apache.kafka.common.security.plain.PlainLoginModule required username=\"${KAFKA_KEY}\" password=\"${KAFKA_SECRET}\";" \
  -e CONNECT_KEY_CONVERTER=io.confluent.connect.avro.AvroConverter \
  -e CONNECT_KEY_CONVERTER_SCHEMA_REGISTRY_URL="${SR_URL}" \
  -e CONNECT_KEY_CONVERTER_BASIC_AUTH_CREDENTIALS_SOURCE=USER_INFO \
  -e CONNECT_KEY_CONVERTER_SCHEMA_REGISTRY_BASIC_AUTH_USER_INFO="${SR_KEY}:${SR_SECRET}" \
  -e CONNECT_VALUE_CONVERTER=io.confluent.connect.avro.AvroConverter \
  -e CONNECT_VALUE_CONVERTER_SCHEMA_REGISTRY_URL="${SR_URL}" \
  -e CONNECT_VALUE_CONVERTER_BASIC_AUTH_CREDENTIALS_SOURCE=USER_INFO \
  -e CONNECT_VALUE_CONVERTER_SCHEMA_REGISTRY_BASIC_AUTH_USER_INFO="${SR_KEY}:${SR_SECRET}" \
  quay.io/debezium/connect:3.0

echo "Waiting for Debezium REST API to be ready..."
for i in {1..60}; do
  if curl -s http://127.0.0.1:8083/ >/dev/null 2>&1; then
    echo "Debezium is up!"
    break
  fi
  sleep 2
done

echo "Registering postgres-cdc connector for healthcaredb..."
curl -s -X PUT http://127.0.0.1:8083/connectors/postgres-cdc/config \
  -H "Content-Type: application/json" \
  -d '{
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "tasks.max": "1",
    "plugin.name": "pgoutput",
    "database.hostname": "'"${PG_HOST}"'",
    "database.port": "5432",
    "database.user": "dbadmin",
    "database.password": "localdevonly",
    "database.dbname": "healthcaredb",
    "database.server.name": "cdc",
    "topic.prefix": "cdc",
    "schema.include.list": "public",
    "table.include.list": "public.care_areas,public.patients,public.devices,public.device_assignments,public.prescriptions,public.telemetry_events",
    "publication.name": "healthcare_cdc_publication",
    "publication.autocreate.mode": "disabled",
    "slot.name": "debezium_slot",
    "snapshot.mode": "initial",
    "tombstones.on.delete": "true",
    "decimal.handling.mode": "double",
    "time.precision.mode": "connect"
  }'

echo "Postgres CDC Connector configured."
