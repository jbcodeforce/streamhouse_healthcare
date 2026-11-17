# Debezium Connect internal storage topics (Replication factor 3 is mandatory in Confluent Cloud)
resource "confluent_kafka_topic" "connect_configs" {
  kafka_cluster {
    id = confluent_kafka_cluster.cluster.id
  }
  topic_name       = "my_connect_configs"
  partitions_count = 1
  rest_endpoint    = confluent_kafka_cluster.cluster.rest_endpoint
  config = {
    "cleanup.policy" = "compact"
  }
  credentials {
    key    = confluent_api_key.app_manager_kafka_key.id
    secret = confluent_api_key.app_manager_kafka_key.secret
  }
}

resource "confluent_kafka_topic" "connect_offsets" {
  kafka_cluster {
    id = confluent_kafka_cluster.cluster.id
  }
  topic_name       = "my_connect_offsets"
  partitions_count = 25
  rest_endpoint    = confluent_kafka_cluster.cluster.rest_endpoint
  config = {
    "cleanup.policy" = "compact"
  }
  credentials {
    key    = confluent_api_key.app_manager_kafka_key.id
    secret = confluent_api_key.app_manager_kafka_key.secret
  }
}

resource "confluent_kafka_topic" "connect_status" {
  kafka_cluster {
    id = confluent_kafka_cluster.cluster.id
  }
  topic_name       = "my_connect_status"
  partitions_count = 5
  rest_endpoint    = confluent_kafka_cluster.cluster.rest_endpoint
  config = {
    "cleanup.policy" = "compact"
  }
  credentials {
    key    = confluent_api_key.app_manager_kafka_key.id
    secret = confluent_api_key.app_manager_kafka_key.secret
  }
}

# Chat conversations topic for RTCE agent history
resource "confluent_kafka_topic" "agent_conversations" {
  kafka_cluster {
    id = confluent_kafka_cluster.cluster.id
  }
  topic_name       = "agent_conversations"
  partitions_count = 1
  rest_endpoint    = confluent_kafka_cluster.cluster.rest_endpoint
  credentials {
    key    = confluent_api_key.app_manager_kafka_key.id
    secret = confluent_api_key.app_manager_kafka_key.secret
  }
}
