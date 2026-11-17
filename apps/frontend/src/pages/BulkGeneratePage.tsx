import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { generateBulkTelemetry } from '../api/telemetryEvents'
import { ArrowLeft, Play } from 'lucide-react'

export const BulkGeneratePage: React.FC = () => {
  const navigate = useNavigate()
  const [count, setCount] = useState(50)
  const [patientId, setPatientId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await generateBulkTelemetry({
        count,
        patient_id: patientId ? patientId : undefined,
        minutes_interval: 5,
      })
      setResult(`Successfully injected ${res.generated_count} simulated telemetry events into PostgreSQL! Debezium CDC is propagating records.`)
      setTimeout(() => navigate('/telemetry'), 1500)
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/telemetry" className="btn btn-secondary">
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Bulk Generate Vitals Telemetry</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Simulate realistic continuous vital sign streams (Heart Rate, SpO2, Blood Pressure, GPS) into PostgreSQL to drive Flink aggregations and alerts.
        </p>

        {result && (
          <div style={{ padding: '0.75rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {result}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Number of Events (1 - 500)
            </label>
            <input
              type="number"
              min="1"
              max="500"
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 10)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Specific Patient ID (Optional — leave blank for random patient distribution)
            </label>
            <input
              type="text"
              placeholder="e.g. P001"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
              value={patientId}
              onChange={(e) => setPatientId(e.target.value.toUpperCase())}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            <Play size={16} /> {loading ? 'Generating Stream...' : `Generate ${count} Telemetry Events`}
          </button>
        </form>
      </div>
    </div>
  )
}
