#!/usr/bin/env bash
# Source this file: source scripts/set_env_from_tf.sh
# Reads Terraform outputs from IaC/ccloud and updates apps/backend/.env

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CCLOUD_DIR="${ROOT_DIR}/IaC/ccloud"
RTCE_DIR="${ROOT_DIR}/IaC/rtce"
ENV_FILE="${ROOT_DIR}/apps/backend/.env"

if [[ ! -d "${CCLOUD_DIR}" ]]; then
  echo "Error: ${CCLOUD_DIR} not found"
  return 1 2>/dev/null || exit 1
fi

echo "Reading Terraform outputs from IaC/ccloud..."
pushd "${CCLOUD_DIR}" > /dev/null

ENV_ID=$(terraform output -raw environment_id 2>/dev/null || echo "")
ENV_NAME=$(terraform output -raw env_display_name 2>/dev/null || echo "")
CC_REGION=$(terraform output -raw cc_region 2>/dev/null || echo "us-east-1")
CLOUD_PROVIDER=$(terraform output -raw cloud_provider 2>/dev/null || echo "AWS")
KAFKA_ID=$(terraform output -raw kafka_id 2>/dev/null || echo "")
KAFKA_NAME=$(terraform output -raw kafka_name 2>/dev/null || echo "")
KAFKA_BOOTSTRAP=$(terraform output -raw kafka_bootstrap_endpoint 2>/dev/null | sed 's|SASL_SSL://||g' || echo "")
KAFKA_REST=$(terraform output -raw kafka_rest_endpoint 2>/dev/null || echo "")
KAFKA_KEY=$(terraform output -raw kafka_api_key_id 2>/dev/null || echo "")
KAFKA_SECRET=$(terraform output -raw kafka_api_key_secret 2>/dev/null || echo "")

SR_ID=$(terraform output -raw schema_registry_id 2>/dev/null || echo "")
SR_REST=$(terraform output -raw schema_registry_rest_endpoint 2>/dev/null || echo "")
SR_KEY=$(terraform output -raw schema_registry_api_key_id 2>/dev/null || echo "")
SR_SECRET=$(terraform output -raw schema_registry_api_key_secret 2>/dev/null || echo "")

FLINK_POOL=$(terraform output -raw flink_compute_pool_id 2>/dev/null || echo "")
FLINK_ALERTS_POOL=$(terraform output -raw flink_alerts_compute_pool_id 2>/dev/null || echo "")
FLINK_DEVICE_POOL=$(terraform output -raw flink_device_compute_pool_id 2>/dev/null || echo "")
FLINK_SN_POOL=$(terraform output -raw flink_sn_compute_pool_id 2>/dev/null || echo "")
FLINK_KEY=$(terraform output -raw flink_api_key_id 2>/dev/null || echo "")
FLINK_SECRET=$(terraform output -raw flink_api_key_secret 2>/dev/null || echo "")

popd > /dev/null

RTCE_KEY=""
RTCE_SECRET=""
if [[ -d "${RTCE_DIR}" && -f "${RTCE_DIR}/terraform.tfstate" ]]; then
  pushd "${RTCE_DIR}" > /dev/null
  RTCE_KEY=$(terraform output -raw rtce_api_key_id 2>/dev/null || echo "")
  RTCE_SECRET=$(terraform output -raw rtce_api_key_secret 2>/dev/null || echo "")
  popd > /dev/null
fi

mkdir -p "${ROOT_DIR}/apps/backend"

# Ensure .env exists with defaults
if [[ ! -f "${ENV_FILE}" ]]; then
  cp "${ROOT_DIR}/apps/backend/.env.example" "${ENV_FILE}" 2>/dev/null || touch "${ENV_FILE}"
fi

upsert_env() {
  local key="$1"
  local val="$2"
  if [[ -z "${val}" ]]; then return; fi
  if grep -q "^${key}=" "${ENV_FILE}" 2>/dev/null; then
    # sed in place
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|^${key}=.*|${key}=${val}|" "${ENV_FILE}"
    else
      sed -i "s|^${key}=.*|${key}=${val}|" "${ENV_FILE}"
    fi
  else
    echo "${key}=${val}" >> "${ENV_FILE}"
  fi
  export "${key}=${val}"
}

upsert_env "DATABASE_URL" "postgresql://dbadmin:localdevonly@localhost:5432/healthcaredb?sslmode=prefer"
upsert_env "CONFLUENT_ENVIRONMENT_ID" "${ENV_ID}"
upsert_env "CLOUD_REGION" "${CC_REGION}"
upsert_env "CLOUD_PROVIDER" "${CLOUD_PROVIDER}"
upsert_env "KAFKA_CLUSTER_ID" "${KAFKA_ID}"
upsert_env "KAFKA_CLUSTER_NAME" "${KAFKA_NAME}"
upsert_env "KAFKA_BOOTSTRAP_SERVERS" "${KAFKA_BOOTSTRAP}"
upsert_env "KAFKA_REST_ENDPOINT" "${KAFKA_REST}"
upsert_env "KAFKA_API_KEY" "${KAFKA_KEY}"
upsert_env "KAFKA_API_SECRET" "${KAFKA_SECRET}"

upsert_env "SCHEMA_REGISTRY_ID" "${SR_ID}"
upsert_env "SCHEMA_REGISTRY_URL" "${SR_REST}"
upsert_env "SCHEMA_REGISTRY_API_KEY" "${SR_KEY}"
upsert_env "SCHEMA_REGISTRY_API_SECRET" "${SR_SECRET}"

upsert_env "FLINK_CATALOG" "${ENV_NAME}"
upsert_env "FLINK_DATABASE" "${KAFKA_NAME}"
upsert_env "FLINK_REST_ENDPOINT" "https://flink.${CC_REGION}.${CLOUD_PROVIDER}.confluent.cloud"
upsert_env "FLINK_COMPUTE_POOL_ID" "${FLINK_POOL}"
upsert_env "FLINK_PATIENT_MONITORING_COMPUTE_POOL_ID" "${FLINK_POOL}"
upsert_env "FLINK_CLINICAL_ALERTS_COMPUTE_POOL_ID" "${FLINK_ALERTS_POOL}"
upsert_env "FLINK_DEVICE_OPS_COMPUTE_POOL_ID" "${FLINK_DEVICE_POOL}"
upsert_env "FLINK_SNAPSHOT_COMPUTE_POOL_ID" "${FLINK_SN_POOL}"
upsert_env "FLINK_API_KEY" "${FLINK_KEY}"
upsert_env "FLINK_API_SECRET" "${FLINK_SECRET}"

if [[ -n "${RTCE_KEY}" ]]; then
  upsert_env "CONFLUENT_GLOBAL_KEY" "${RTCE_KEY}"
  upsert_env "CONFLUENT_GLOBAL_SECRET" "${RTCE_SECRET}"
fi

echo "Environment successfully exported and saved to apps/backend/.env"
