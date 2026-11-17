import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AnalyticsPage } from './AnalyticsPage'
import * as analyticsApi from '../api/analytics'

describe('AnalyticsPage', () => {
  it('renders benchmark latency comparison and vitals table', async () => {
    vi.spyOn(analyticsApi, 'getVitalsSummary').mockResolvedValue([
      {
        patient_id: 'P001',
        total_telemetry_events: 150,
        avg_heart_rate: 74.2,
        min_heart_rate: 62,
        max_heart_rate: 98,
        avg_spo2: 98.4,
        min_spo2: 94.0,
        max_spo2: 100.0,
      },
    ])

    vi.spyOn(analyticsApi, 'getBenchmark').mockResolvedValue({
      patient_id: 'P001',
      data: {
        patient_id: 'P001',
        full_name: 'Alice Smith',
        gender: 'F',
        risk_tier: 'HIGH',
        primary_condition: 'Arrhythmia',
        patient_status: 'ACTIVE',
        avg_heart_rate: 74.2,
        avg_spo2: 98.4,
        total_telemetry_events: 150,
        last_telemetry_ts: '2026-11-17T01:30:00Z',
      },
      timings: {
        lightning_ms: 8.4,
        snapshot_ms: 4820.0,
        speedup_factor: 573.8,
      },
    })

    render(<AnalyticsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Lightning \(RTCE\) Serving/i)).toBeInTheDocument()
      expect(screen.getByText(/Flink Snapshot Query/i)).toBeInTheDocument()
      expect(screen.getByText('8.4 ms')).toBeInTheDocument()
      expect(screen.getByText('4820 ms')).toBeInTheDocument()
    })
  })
})
