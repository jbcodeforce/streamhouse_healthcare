output "rtce_api_key_id" {
  value       = confluent_api_key.rtce_global_key.id
  description = "Global RTCE API Key ID"
}

output "rtce_api_key_secret" {
  value       = confluent_api_key.rtce_global_key.secret
  description = "Global RTCE API Key Secret"
  sensitive   = true
}
