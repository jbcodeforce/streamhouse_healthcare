resource "confluent_kafka_cluster" "cluster" {
  display_name = "${var.prefix}-kafka"
  availability = "SINGLE_ZONE"
  cloud        = var.cloud_provider
  region       = var.cc_region
  standard {}

  environment {
    id = confluent_environment.env.id
  }
}

resource "confluent_service_account" "app_manager" {
  display_name = "${var.prefix}-app-manager"
  description  = "Service account for Kafka and Schema Registry management"
}

resource "confluent_role_binding" "app_manager_cluster_admin" {
  principal   = "User:${confluent_service_account.app_manager.id}"
  role_name   = "CloudClusterAdmin"
  crn_pattern = confluent_kafka_cluster.cluster.rbac_crn
}

resource "confluent_api_key" "app_manager_kafka_key" {
  display_name = "${var.prefix}-app-manager-kafka-key"
  description  = "Kafka API Key for ${var.prefix}"
  owner {
    id          = confluent_service_account.app_manager.id
    api_version = confluent_service_account.app_manager.api_version
    kind        = confluent_service_account.app_manager.kind
  }
  managed_resource {
    id          = confluent_kafka_cluster.cluster.id
    api_version = confluent_kafka_cluster.cluster.api_version
    kind        = confluent_kafka_cluster.cluster.kind
    environment {
      id = confluent_environment.env.id
    }
  }
  depends_on = [
    confluent_role_binding.app_manager_cluster_admin
  ]
}
