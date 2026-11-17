export interface TelemetryEvent {
  event_id: string
  device_id: string
  patient_id: string
  event_type: string
  heart_rate: number
  spo2: number
  systolic_bp: number
  diastolic_bp: number
  lat: number
  lng: number
  battery_pct: number
  button_pressed: boolean
  created_at?: string
  updated_at?: string
}

export type TelemetryEventCreate = Omit<TelemetryEvent, 'created_at' | 'updated_at'>

export interface BulkGenerateRequest {
  count: number
  patient_id?: string
  minutes_interval: number
}
