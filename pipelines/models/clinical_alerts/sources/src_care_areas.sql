-- Source model: src_care_areas
-- Note: After editing query logic, run dbt run --full-refresh
{{
    config(
        materialized='streaming_table',
        distributed_by={'columns': ['care_area_id'], 'buckets': 1},
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
    coalesce(IF(op = 'd', before.care_area_id, after.care_area_id), 'UNKNOWN') AS care_area_id,
    coalesce(IF(op = 'd', before.name, after.name), '') AS name,
    coalesce(IF(op = 'd', before.facility_type, after.facility_type), 'WARD') AS facility_type,
    coalesce(IF(op = 'd', before.center_lat, after.center_lat), 41.8781) AS center_lat,
    coalesce(IF(op = 'd', before.center_lng, after.center_lng), -87.6298) AS center_lng,
    coalesce(IF(op = 'd', before.radius_meters, after.radius_meters), 500.0) AS radius_meters,
    `$rowtime` AS event_ts
FROM {{ source('cdc', 'care_areas') }}
WHERE op != 'd'
