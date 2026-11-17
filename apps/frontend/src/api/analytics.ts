import { request } from './client'
import type { BenchmarkResult, VitalsSummaryItem } from '../types/analytics'

export const getVitalsSummary = () => request<VitalsSummaryItem[]>('/analytics/vitals-summary')
export const getBenchmark = (patientId: string) => request<BenchmarkResult>(`/analytics/benchmark/${patientId}`)
