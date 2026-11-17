locals {
  environment_id     = data.terraform_remote_state.ccloud.outputs.environment_id
  kafka_id           = data.terraform_remote_state.ccloud.outputs.kafka_id
  schema_registry_id = data.terraform_remote_state.ccloud.outputs.schema_registry_id
}

resource "confluent_service_account" "rtce_client" {
  display_name = "${var.prefix}-rtce-client"
  description  = "Service account for RTCE Lightning and Chat Assistant"
}

resource "confluent_role_binding" "rtce_client_kafka_admin" {
  principal   = "User:${confluent_service_account.rtce_client.id}"
  role_name   = "CloudClusterAdmin"
  crn_pattern = "crn://confluent.cloud/organization=*/environment=${local.environment_id}/cloud-cluster=${local.kafka_id}"
}

resource "confluent_role_binding" "rtce_client_sr_owner" {
  principal   = "User:${confluent_service_account.rtce_client.id}"
  role_name   = "ResourceOwner"
  crn_pattern = "crn://confluent.cloud/organization=*/environment=${local.environment_id}/schema-registry=${local.schema_registry_id}/subject=*"
}

resource "confluent_api_key" "rtce_global_key" {
  display_name = "${var.prefix}-rtce-global-key"
  description  = "Global API Key for RTCE Lightning Context Engine"
  owner {
    id          = confluent_service_account.rtce_client.id
    api_version = confluent_service_account.rtce_client.api_version
    kind        = confluent_service_account.rtce_client.kind
  }
  managed_resource {
    id          = "global"
    api_version = "global/v1"
    kind        = "Global"
  }
  depends_on = [
    confluent_role_binding.rtce_client_kafka_admin,
    confluent_role_binding.rtce_client_sr_owner
  ]
}

# RTCE topic bindings (applied AFTER dbt creates the compacted upsert fact tables)
resource "confluent_rtce_topic" "fct_patient_360" {
  cloud       = var.cloud_provider
  region      = var.cc_region
  topic_name  = "fct_patient_360"
  description = "Patient 360 analytics profile"

  environment {
    id = local.environment_id
  }
  kafka_cluster {
    id = local.kafka_id
  }
  depends_on = [
    confluent_api_key.rtce_global_key
  ]
}

resource "confluent_rtce_topic" "fct_patient_vitals_summary" {
  cloud       = var.cloud_provider
  region      = var.cc_region
  topic_name  = "fct_patient_vitals_summary"
  description = "Patient Vitals Summary analytics"

  environment {
    id = local.environment_id
  }
  kafka_cluster {
    id = local.kafka_id
  }
  depends_on = [
    confluent_api_key.rtce_global_key
  ]
}
