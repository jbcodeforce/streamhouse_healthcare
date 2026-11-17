variable "confluent_cloud_api_key" {
  type        = string
  description = "Confluent Cloud API Key"
  sensitive   = true
  default     = null
}

variable "confluent_cloud_api_secret" {
  type        = string
  description = "Confluent Cloud API Secret"
  sensitive   = true
  default     = null
}

variable "prefix" {
  type        = string
  description = "Prefix matching the ccloud stack"
  default     = "sh-hc"
}

variable "cloud_provider" {
  type        = string
  description = "Cloud provider"
  default     = "AWS"
}

variable "cc_region" {
  type        = string
  description = "Cloud region"
  default     = "us-east-1"
}

variable "core_state_path" {
  type        = string
  description = "Path to ccloud terraform state"
  default     = "../ccloud/terraform.tfstate"
}
