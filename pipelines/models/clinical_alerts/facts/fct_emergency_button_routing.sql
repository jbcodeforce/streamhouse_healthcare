-- Fact model: fct_emergency_button_routing (CEP)
-- Detects rapid repeated patient emergency button presses (2 or more within 5 minutes)
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
    patient_id,
    first_event_id,
    trigger_event_id,
    press_count,
    match_ts AS event_ts
FROM {{ ref('src_telemetry_events') }}
    MATCH_RECOGNIZE (
        PARTITION BY patient_id
        ORDER BY event_ts
        MEASURES
            A.event_id AS first_event_id,
            B.event_id AS trigger_event_id,
            2 AS press_count,
            B.event_ts AS match_ts
        ONE ROW PER MATCH
        AFTER MATCH SKIP TO NEXT ROW
        PATTERN (A B)
        WITHIN INTERVAL '5' MINUTE
        DEFINE
            A AS A.button_pressed = true,
            B AS B.button_pressed = true
    )
