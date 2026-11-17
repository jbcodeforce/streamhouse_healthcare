-- Source model: src_prescriptions
-- Note: After editing query logic, run dbt run --full-refresh
{{
    config(
        materialized='streaming_table',
        distributed_by={'columns': ['prescription_id'], 'buckets': 1},
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
    coalesce(IF(op = 'd', before.prescription_id, after.prescription_id), 'UNKNOWN') AS prescription_id,
    coalesce(IF(op = 'd', before.patient_id, after.patient_id), 'UNKNOWN') AS patient_id,
    coalesce(IF(op = 'd', before.target_metric, after.target_metric), 'HEART_RATE') AS target_metric,
    coalesce(IF(op = 'd', before.min_threshold, after.min_threshold), 60.0) AS min_threshold,
    coalesce(IF(op = 'd', before.max_threshold, after.max_threshold), 100.0) AS max_threshold,
    coalesce(IF(op = 'd', before.status, after.status), 'ACTIVE') AS status,
    `$rowtime` AS event_ts
FROM {{ source('cdc', 'prescriptions') }}
WHERE op != 'd'
