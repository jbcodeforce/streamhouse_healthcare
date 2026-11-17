-- Source model: src_telemetry_events
-- Note: After editing query logic, run dbt run --full-refresh
{{
    config(
        materialized='streaming_table',
        distributed_by={'columns': ['event_id'], 'buckets': 1},
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
    coalesce(IF(op = 'd', before.event_id, after.event_id), 'UNKNOWN') AS event_id,
    coalesce(IF(op = 'd', before.device_id, after.device_id), 'UNKNOWN') AS device_id,
    coalesce(IF(op = 'd', before.patient_id, after.patient_id), 'UNKNOWN') AS patient_id,
    coalesce(IF(op = 'd', before.event_type, after.event_type), 'VITALS') AS event_type,
    coalesce(IF(op = 'd', before.heart_rate, after.heart_rate), 75) AS heart_rate,
    coalesce(IF(op = 'd', before.spo2, after.spo2), 98.0) AS spo2,
    coalesce(IF(op = 'd', before.systolic_bp, after.systolic_bp), 120) AS systolic_bp,
    coalesce(IF(op = 'd', before.diastolic_bp, after.diastolic_bp), 80) AS diastolic_bp,
    coalesce(IF(op = 'd', before.lat, after.lat), 41.8781) AS lat,
    coalesce(IF(op = 'd', before.lng, after.lng), -87.6298) AS lng,
    coalesce(IF(op = 'd', before.battery_pct, after.battery_pct), 100) AS battery_pct,
    coalesce(IF(op = 'd', before.button_pressed, after.button_pressed), false) AS button_pressed,
    `$rowtime` AS event_ts
FROM {{ source('cdc', 'telemetry_events') }}
WHERE op != 'd'
