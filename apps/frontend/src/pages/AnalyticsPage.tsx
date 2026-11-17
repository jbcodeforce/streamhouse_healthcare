import React, { useEffect, useState } from 'react'
import { getBenchmark, getVitalsSummary } from '../api/analytics'
import type { BenchmarkResult, VitalsSummaryItem } from '../types/analytics'
import { Zap, Clock, Search } from 'lucide-react'

export const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<VitalsSummaryItem[]>([])
  const [patientId, setPatientId] = useState('P001')
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getVitalsSummary().then(setSummary).catch(console.error)
    handleRunBenchmark('P001')
  }, [])

  const handleRunBenchmark = async (pid: string) => {
    setLoading(true)
    try {
      const res = await getBenchmark(pid)
      setBenchmark(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Analytics &amp; Serving Benchmark</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Comparing Snapshot Flink Query latency vs. Confluent Cloud Lightning (RTCE) sub-10ms point lookup.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap color="#2563eb" size={20} /> Patient 360 Point Lookup Latency Benchmark
        </h2>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            className="input"
            style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', width: 220 }}
            value={patientId}
            onChange={(e) => setPatientId(e.target.value.toUpperCase())}
            placeholder="e.g. P001, P002..."
          />
          <button
            className="btn btn-primary"
            onClick={() => handleRunBenchmark(patientId)}
            disabled={loading}
          >
            <Search size={16} /> {loading ? 'Running Benchmark...' : 'Execute Benchmark'}
          </button>
        </div>

        {benchmark && (
          <div>
            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Zap size={18} color="#16a34a" />
                  <span style={{ fontWeight: 600, color: '#166534' }}>Lightning (RTCE) Serving</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#166534' }}>
                  {benchmark.timings.lightning_ms} ms
                </div>
                <p style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>
                  Direct low-latency key-value point lookup against compacted topic index.
                </p>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Clock size={18} color="#2563eb" />
                  <span style={{ fontWeight: 600, color: '#1e40af' }}>Flink Snapshot Query</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e40af' }}>
                  {benchmark.timings.snapshot_ms} ms
                </div>
                <p style={{ fontSize: '0.75rem', color: '#1d4ed8', marginTop: '0.25rem' }}>
                  Ad-hoc SQL query submitted to dedicated snapshot Flink compute pool.
                </p>
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                Retrieved Patient 360 Record for {benchmark.data.full_name} ({benchmark.data.patient_id}):
              </div>
              <div className="grid-4" style={{ fontSize: '0.875rem' }}>
                <div><strong>Risk Tier:</strong> <span className="badge badge-high">{benchmark.data.risk_tier}</span></div>
                <div><strong>Condition:</strong> {benchmark.data.primary_condition}</div>
                <div><strong>Avg Heart Rate:</strong> {benchmark.data.avg_heart_rate} bpm</div>
                <div><strong>Avg SpO2:</strong> {benchmark.data.avg_spo2}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Real-Time Aggregated Vitals Summary (fct_patient_vitals_summary)
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Total Telemetry Events</th>
                <th>Avg Heart Rate</th>
                <th>Min / Max HR</th>
                <th>Avg SpO2</th>
                <th>Min / Max SpO2</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((item) => (
                <tr key={item.patient_id}>
                  <td><strong>{item.patient_id}</strong></td>
                  <td>{item.total_telemetry_events}</td>
                  <td>{item.avg_heart_rate.toFixed(1)} bpm</td>
                  <td>{item.min_heart_rate} - {item.max_heart_rate} bpm</td>
                  <td>{item.avg_spo2.toFixed(1)}%</td>
                  <td>{item.min_spo2}% - {item.max_spo2}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
