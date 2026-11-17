-- Dimension model: dim_patients
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
    p.patient_id,
    p.full_name,
    p.gender,
    p.birth_date,
    p.risk_tier,
    p.primary_condition,
    p.status,
    coalesce(g.normal_hr_min, 60) AS guideline_hr_min,
    coalesce(g.normal_hr_max, 100) AS guideline_hr_max,
    coalesce(g.normal_spo2_min, 95.0) AS guideline_spo2_min,
    p.event_ts
FROM {{ ref('src_patients') }} AS p
LEFT JOIN LATERAL SNAPSHOT(
    input => TABLE {{ ref('ref_vital_guidelines') }},
    on_time => DESCRIPTOR(p.event_ts),
    load_completed_idle_timeout => INTERVAL '1' MINUTE
) AS g ON p.risk_tier = g.risk_tier
