-- Source model: src_device_assignments
-- Note: After editing query logic, run dbt run --full-refresh
{{
    config(
        materialized='streaming_table',
        distributed_by={'columns': ['assignment_id'], 'buckets': 1},
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
    coalesce(IF(op = 'd', before.assignment_id, after.assignment_id), 'UNKNOWN') AS assignment_id,
    coalesce(IF(op = 'd', before.patient_id, after.patient_id), 'UNKNOWN') AS patient_id,
    coalesce(IF(op = 'd', before.device_id, after.device_id), 'UNKNOWN') AS device_id,
    coalesce(IF(op = 'd', before.care_area_id, after.care_area_id), 'UNKNOWN') AS care_area_id,
    coalesce(IF(op = 'd', before.bed_label, after.bed_label), 'UNASSIGNED') AS bed_label,
    coalesce(IF(op = 'd', before.status, after.status), 'ACTIVE') AS status,
    `$rowtime` AS event_ts
FROM {{ source('cdc', 'device_assignments') }}
WHERE op != 'd'
