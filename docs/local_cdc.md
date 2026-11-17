# Local CDC & PostgreSQL Automation

The hybrid deployment uses local PostgreSQL 17 and a local Debezium Connect worker streaming directly into Confluent Cloud Kafka over SASL_SSL.

---

## 1. Start PostgreSQL 17

Run the automation script in `IaC/local/`:

```bash
./IaC/local/start_local_pg_server.sh --seed
```

This starts a container with:
- `wal_level = logical`
- `max_wal_senders = 10`
- `max_replication_slots = 10`
- Database: `healthcaredb` (User: `dbadmin`, Password: `localdevonly`)
- Automatic schema DDL execution and CSV seeding via `apps/backend/bootstrap.py`
- Publication creation: `CREATE PUBLICATION healthcare_cdc_publication FOR TABLE ...`

---

## 2. Start Debezium Connect Worker

```bash
./IaC/local/start_debezium.sh
```

The script:
1. Connects to Confluent Cloud Kafka (SASL_SSL / PLAIN) and Schema Registry.
2. Ensures internal storage topics (`my_connect_configs`, `my_connect_offsets`, `my_connect_status`) exist with **Replication Factor 3** and `cleanup.policy=compact`.
3. Starts `quay.io/debezium/connect:3.0` with Avro key/value converters configured against Schema Registry.
4. Registers the `postgres-cdc` connector using the `pgoutput` plugin.

---

## Verifying CDC Streams

Inspect live CDC records captured into Kafka topics:

```bash
confluent kafka topic consume cdc.public.patients --value-format avro --from-beginning
confluent kafka topic consume cdc.public.telemetry_events --value-format avro
```
