-- Source model: src_patients
-- Note: After editing query logic, run dbt run --full-refresh
{{
    config(
        materialized='streaming_table',
        distributed_by={'columns': ['patient_id'], 'buckets': 1},
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
    coalesce(IF(op = 'd', before.patient_id, after.patient_id), 'UNKNOWN') AS patient_id,
    coalesce(IF(op = 'd', before.full_name, after.full_name), '') AS full_name,
    coalesce(IF(op = 'd', before.gender, after.gender), 'U') AS gender,
    coalesce(IF(op = 'd', before.birth_date, after.birth_date), '1970-01-01') AS birth_date,
    coalesce(IF(op = 'd', before.risk_tier, after.risk_tier), 'LOW') AS risk_tier,
    coalesce(IF(op = 'd', before.primary_condition, after.primary_condition), 'General Observation') AS primary_condition,
    coalesce(IF(op = 'd', before.status, after.status), 'ACTIVE') AS status,
    `$rowtime` AS event_ts
FROM {{ source('cdc', 'patients') }}
WHERE op != 'd'
