-- Fact model: fct_vital_anomaly_streak (CEP)
-- Detects 3 consecutive abnormal vital readings (HR > 115 bpm or SpO2 < 91%) within 15 minutes
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
    avg_hr_streak,
    min_spo2_streak,
    match_ts AS event_ts
FROM {{ ref('src_telemetry_events') }}
    MATCH_RECOGNIZE (
        PARTITION BY patient_id
        ORDER BY event_ts
        MEASURES
            A.event_id AS first_event_id,
            C.event_id AS trigger_event_id,
            (A.heart_rate + B.heart_rate + C.heart_rate) / 3.0 AS avg_hr_streak,
            LEAST(A.spo2, B.spo2, C.spo2) AS min_spo2_streak,
            C.event_ts AS match_ts
        ONE ROW PER MATCH
        AFTER MATCH SKIP TO NEXT ROW
        PATTERN (A B C)
        WITHIN INTERVAL '15' MINUTE
        DEFINE
            A AS (A.heart_rate > 115 OR A.spo2 < 91.0),
            B AS (B.heart_rate > 115 OR B.spo2 < 91.0),
            C AS (C.heart_rate > 115 OR C.spo2 < 91.0)
    )
