export interface BenchmarkResult {
  patient_id: string
  data: {
    patient_id: string
    full_name: string
    gender: string
    risk_tier: string
    primary_condition: string
    patient_status: string
    avg_heart_rate: number
    avg_spo2: number
    total_telemetry_events: number
    last_telemetry_ts: string
  }
  timings: {
    lightning_ms: number
    snapshot_ms: number
    speedup_factor: number
  }
}

export interface VitalsSummaryItem {
  patient_id: string
  total_telemetry_events: number
  avg_heart_rate: number
  min_heart_rate: number
  max_heart_rate: number
  avg_spo2: number
  min_spo2: number
  max_spo2: number
}
