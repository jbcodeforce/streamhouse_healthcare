variable "confluent_cloud_api_key" {
  type        = string
  description = "Confluent Cloud API Key"
  sensitive   = true
}

variable "confluent_cloud_api_secret" {
  type        = string
  description = "Confluent Cloud API Secret"
  sensitive   = true
}

variable "prefix" {
  type        = string
  description = "Prefix for all created resources"
  default     = "sh-hc"
}

variable "cloud_provider" {
  type        = string
  description = "Cloud provider for Kafka cluster and Flink pools"
  default     = "AWS"
}

variable "cc_region" {
  type        = string
  description = "Cloud region for Kafka cluster and Flink pools"
  default     = "us-east-1"
}

variable "flink_max_cfu" {
  type        = number
  description = "Maximum CFUs for main Flink compute pool"
  default     = 10
}

variable "flink_alerts_max_cfu" {
  type        = number
  description = "Maximum CFUs for clinical alerts Flink compute pool"
  default     = 10
}

variable "flink_device_max_cfu" {
  type        = number
  description = "Maximum CFUs for device ops Flink compute pool"
  default     = 10
}

variable "flink_sn_max_cfu" {
  type        = number
  description = "Maximum CFUs for snapshot query Flink compute pool"
  default     = 10
}
