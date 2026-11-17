-- Fact model: fct_geofence_alerts
-- Detects telemetry events reporting coordinates outside assigned care area radius
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
    t.event_id,
    t.patient_id,
    t.device_id,
    t.lat AS current_lat,
    t.lng AS current_lng,
    a.care_area_id,
    c.center_lat,
    c.center_lng,
    c.radius_meters,
    t.event_ts
FROM {{ ref('src_telemetry_events') }} AS t
JOIN {{ ref('src_device_assignments') }} AS a
    ON t.patient_id = a.patient_id AND t.device_id = a.device_id
JOIN {{ ref('src_care_areas') }} AS c
    ON a.care_area_id = c.care_area_id
WHERE ABS(t.lat - c.center_lat) > 0.005 OR ABS(t.lng - c.center_lng) > 0.005
