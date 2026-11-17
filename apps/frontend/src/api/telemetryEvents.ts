import { request } from './client'
import type { BulkGenerateRequest, TelemetryEvent, TelemetryEventCreate } from '../types/telemetryEvent'

export const getTelemetryEvents = (patientId?: string, limit = 100) =>
  request<TelemetryEvent[]>(patientId ? `/telemetry-events?patient_id=${patientId}&limit=${limit}` : `/telemetry-events?limit=${limit}`)
export const getTelemetryEvent = (id: string) => request<TelemetryEvent>(`/telemetry-events/${id}`)
export const createTelemetryEvent = (data: TelemetryEventCreate) =>
  request<TelemetryEvent>('/telemetry-events', { method: 'POST', body: JSON.stringify(data) })
export const generateBulkTelemetry = (data: BulkGenerateRequest) =>
  request<{ generated_count: number }>('/telemetry-events/generate', { method: 'POST', body: JSON.stringify(data) })
