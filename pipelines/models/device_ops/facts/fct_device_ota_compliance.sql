-- Fact model: fct_device_ota_compliance
-- Assesses device firmware vs manufacturer target firmware
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
    d.device_id,
    d.model_id,
    d.serial_number,
    d.firmware_version AS current_firmware,
    coalesce(m.target_firmware_version, 'v1.0.0') AS target_firmware,
    CASE
        WHEN d.firmware_version != coalesce(m.target_firmware_version, 'v1.0.0') THEN 'UPDATE_REQUIRED'
        ELSE 'COMPLIANT'
    END AS ota_status,
    d.battery_pct,
    d.event_ts
FROM {{ ref('src_devices') }} AS d
LEFT JOIN LATERAL SNAPSHOT(
    input => TABLE {{ ref('ref_device_models') }},
    on_time => DESCRIPTOR(d.event_ts),
    load_completed_idle_timeout => INTERVAL '1' MINUTE
) AS m ON d.model_id = m.model_id
