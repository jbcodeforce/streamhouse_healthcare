output "environment_id" {
  value       = confluent_environment.env.id
  description = "Confluent Cloud Environment ID"
}

output "env_display_name" {
  value       = confluent_environment.env.display_name
  description = "Confluent Cloud Environment Display Name (used as Flink catalog name)"
}

output "cc_region" {
  value       = var.cc_region
  description = "Cloud Region"
}

output "cloud_provider" {
  value       = var.cloud_provider
  description = "Cloud Provider"
}

output "kafka_id" {
  value       = confluent_kafka_cluster.cluster.id
  description = "Kafka Cluster ID"
}

output "kafka_name" {
  value       = confluent_kafka_cluster.cluster.display_name
  description = "Kafka Cluster Display Name (used as Flink database name)"
}

output "kafka_bootstrap_endpoint" {
  value       = confluent_kafka_cluster.cluster.bootstrap_endpoint
  description = "Kafka Bootstrap Server endpoint"
}

output "kafka_rest_endpoint" {
  value       = confluent_kafka_cluster.cluster.rest_endpoint
  description = "Kafka REST endpoint"
}

output "kafka_api_key_id" {
  value       = confluent_api_key.app_manager_kafka_key.id
  description = "Kafka API Key ID"
}

output "kafka_api_key_secret" {
  value       = confluent_api_key.app_manager_kafka_key.secret
  description = "Kafka API Key Secret"
  sensitive   = true
}

output "schema_registry_id" {
  value       = data.confluent_schema_registry_cluster.sr.id
  description = "Schema Registry Cluster ID"
}

output "schema_registry_rest_endpoint" {
  value       = data.confluent_schema_registry_cluster.sr.rest_endpoint
  description = "Schema Registry REST Endpoint"
}

output "schema_registry_api_key_id" {
  value       = confluent_api_key.sr_key.id
  description = "Schema Registry API Key ID"
}

output "schema_registry_api_key_secret" {
  value       = confluent_api_key.sr_key.secret
  description = "Schema Registry API Key Secret"
  sensitive   = true
}

output "flink_compute_pool_id" {
  value       = confluent_flink_compute_pool.patient_pool.id
  description = "Main Patient Monitoring Flink Compute Pool ID"
}

output "flink_alerts_compute_pool_id" {
  value       = confluent_flink_compute_pool.alerts_pool.id
  description = "Clinical Alerts Flink Compute Pool ID"
}

output "flink_device_compute_pool_id" {
  value       = confluent_flink_compute_pool.device_pool.id
  description = "Device Ops Flink Compute Pool ID"
}

output "flink_sn_compute_pool_id" {
  value       = confluent_flink_compute_pool.snapshot_pool.id
  description = "Snapshot Query Flink Compute Pool ID"
}

output "flink_api_key_id" {
  value       = confluent_api_key.flink_api_key.id
  description = "Flink API Key ID"
}

output "flink_api_key_secret" {
  value       = confluent_api_key.flink_api_key.secret
  description = "Flink API Key Secret"
  sensitive   = true
}
