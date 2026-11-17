data "confluent_flink_region" "flink_region" {
  cloud  = var.cloud_provider
  region = var.cc_region
}

# 1. Main patient_monitoring compute pool
resource "confluent_flink_compute_pool" "patient_pool" {
  display_name = "${var.prefix}-flink-pool"
  cloud        = var.cloud_provider
  region       = var.cc_region
  max_cfu      = var.flink_max_cfu
  environment {
    id = confluent_environment.env.id
  }
  depends_on = [
    confluent_kafka_cluster.cluster
  ]
}

# 2. Clinical alerts compute pool
resource "confluent_flink_compute_pool" "alerts_pool" {
  display_name = "${var.prefix}-alerts-flink-pool"
  cloud        = var.cloud_provider
  region       = var.cc_region
  max_cfu      = var.flink_alerts_max_cfu
  environment {
    id = confluent_environment.env.id
  }
  depends_on = [
    confluent_kafka_cluster.cluster
  ]
}

# 3. Device ops compute pool
resource "confluent_flink_compute_pool" "device_pool" {
  display_name = "${var.prefix}-device-flink-pool"
  cloud        = var.cloud_provider
  region       = var.cc_region
  max_cfu      = var.flink_device_max_cfu
  environment {
    id = confluent_environment.env.id
  }
  depends_on = [
    confluent_kafka_cluster.cluster
  ]
}

# 4. Snapshot query pool (dedicated so ad-hoc SQL does not compete with streaming statements)
resource "confluent_flink_compute_pool" "snapshot_pool" {
  display_name = "${var.prefix}-snapshot-q-pool"
  cloud        = var.cloud_provider
  region       = var.cc_region
  max_cfu      = var.flink_sn_max_cfu
  environment {
    id = confluent_environment.env.id
  }
  depends_on = [
    confluent_kafka_cluster.cluster
  ]
}

resource "confluent_service_account" "flink_runner" {
  display_name = "${var.prefix}-flink-runner"
  description  = "Service account for Flink SQL deployment and execution"
}

resource "confluent_role_binding" "flink_runner_env_admin" {
  principal   = "User:${confluent_service_account.flink_runner.id}"
  role_name   = "EnvironmentAdmin"
  crn_pattern = confluent_environment.env.resource_name
}

resource "confluent_role_binding" "flink_runner_assigner" {
  principal   = "User:${confluent_service_account.flink_runner.id}"
  role_name   = "Assigner"
  crn_pattern = "${confluent_environment.env.resource_name}/service-account=${confluent_service_account.flink_runner.id}"
}

resource "confluent_api_key" "flink_api_key" {
  display_name = "${var.prefix}-flink-api-key"
  description  = "Flink API Key for ${var.prefix}"
  owner {
    id          = confluent_service_account.flink_runner.id
    api_version = confluent_service_account.flink_runner.api_version
    kind        = confluent_service_account.flink_runner.kind
  }
  managed_resource {
    id          = data.confluent_flink_region.flink_region.id
    api_version = data.confluent_flink_region.flink_region.api_version
    kind        = data.confluent_flink_region.flink_region.kind
    environment {
      id = confluent_environment.env.id
    }
  }
  depends_on = [
    confluent_role_binding.flink_runner_env_admin,
    confluent_role_binding.flink_runner_assigner
  ]
}
