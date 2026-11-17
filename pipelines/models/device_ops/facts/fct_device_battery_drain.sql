-- Fact model: fct_device_battery_drain (CEP)
-- Detects abnormal rapid battery drain (battery dropping >= 15% within 10 minutes)
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
    device_id,
    start_event_id,
    trigger_event_id,
    initial_battery_pct,
    current_battery_pct,
    battery_drop,
    match_ts AS event_ts
FROM {{ ref('src_telemetry_events') }}
    MATCH_RECOGNIZE (
        PARTITION BY device_id
        ORDER BY event_ts
        MEASURES
            A.event_id AS start_event_id,
            B.event_id AS trigger_event_id,
            A.battery_pct AS initial_battery_pct,
            B.battery_pct AS current_battery_pct,
            A.battery_pct - B.battery_pct AS battery_drop,
            B.event_ts AS match_ts
        ONE ROW PER MATCH
        AFTER MATCH SKIP TO NEXT ROW
        PATTERN (A B)
        WITHIN INTERVAL '10' MINUTE
        DEFINE
            A AS A.battery_pct > 0,
            B AS (A.battery_pct - B.battery_pct) >= 15
    )
