data "confluent_schema_registry_cluster" "sr" {
  environment {
    id = confluent_environment.env.id
  }
  depends_on = [
    confluent_environment.env
  ]
}

resource "confluent_role_binding" "app_manager_sr_admin" {
  principal   = "User:${confluent_service_account.app_manager.id}"
  role_name   = "ResourceOwner"
  crn_pattern = "${data.confluent_schema_registry_cluster.sr.resource_name}/subject=*"
}

resource "confluent_api_key" "sr_key" {
  display_name = "${var.prefix}-sr-key"
  description  = "Schema Registry API Key for ${var.prefix}"
  owner {
    id          = confluent_service_account.app_manager.id
    api_version = confluent_service_account.app_manager.api_version
    kind        = confluent_service_account.app_manager.kind
  }
  managed_resource {
    id          = data.confluent_schema_registry_cluster.sr.id
    api_version = data.confluent_schema_registry_cluster.sr.api_version
    kind        = data.confluent_schema_registry_cluster.sr.kind
    environment {
      id = confluent_environment.env.id
    }
  }
  depends_on = [
    confluent_role_binding.app_manager_sr_admin
  ]
}
