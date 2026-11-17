resource "confluent_environment" "env" {
  display_name = "${var.prefix}-env"

  stream_governance {
    package = "ESSENTIALS"
  }
}
