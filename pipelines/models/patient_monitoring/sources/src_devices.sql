-- Source model: src_devices
-- Note: After editing query logic, run dbt run --full-refresh
{{
    config(
        materialized='streaming_table',
        distributed_by={'columns': ['device_id'], 'buckets': 1},
        with={
            'changelog.mode': 'append',
            'kafka.cleanup-policy': 'delete',
            'scan.bounded.mode': 'unbounded',
            'scan.startup.mode': 'earliest-offset',
            'value.format': 'avro-registry'
        }
    )
}}

SELECT
    coalesce(IF(op = 'd', before.device_id, after.device_id), 'UNKNOWN') AS device_id,
    coalesce(IF(op = 'd', before.model_id, after.model_id), 'MOD-OX-100') AS model_id,
    coalesce(IF(op = 'd', before.serial_number, after.serial_number), '') AS serial_number,
    coalesce(IF(op = 'd', before.firmware_version, after.firmware_version), 'v1.0.0') AS firmware_version,
    coalesce(IF(op = 'd', before.battery_pct, after.battery_pct), 100) AS battery_pct,
    coalesce(IF(op = 'd', before.status, after.status), 'AVAILABLE') AS status,
    `$rowtime` AS event_ts
FROM {{ source('cdc', 'devices') }}
WHERE op != 'd'
