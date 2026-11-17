import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTelemetryEvents } from '../api/telemetryEvents'
import type { TelemetryEvent } from '../types/telemetryEvent'
import { Plus, RefreshCw } from 'lucide-react'

export const TelemetryPage: React.FC = () => {
  const [events, setEvents] = useState<TelemetryEvent[]>([])
  const [loading, setLoading] = useState(false)

  const load = () => {
    setLoading(true)
    getTelemetryEvents(undefined, 100)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Vitals Telemetry Stream</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            High-frequency medical IoT telemetry events (PostgreSQL <code>telemetry_events</code> &rarr; Debezium CDC &rarr; <code>cdc.public.telemetry_events</code>)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={load} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <Link to="/telemetry/generate" className="btn btn-primary">
            <Plus size={16} /> Bulk Generate Telemetry
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Patient ID</th>
                <th>Device ID</th>
                <th>Heart Rate</th>
                <th>SpO2</th>
                <th>Blood Pressure</th>
                <th>GPS (Lat, Lng)</th>
                <th>Battery</th>
                <th>Button Alert</th>
              </tr>
            </thead>
            <tbody>
              {events.map((t) => (
                <tr key={t.event_id}>
                  <td><code>{t.event_id}</code></td>
                  <td><Link to={`/patients/${t.patient_id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>{t.patient_id}</Link></td>
                  <td>{t.device_id}</td>
                  <td><strong>{t.heart_rate} bpm</strong></td>
                  <td>{t.spo2}%</td>
                  <td>{t.systolic_bp} / {t.diastolic_bp} mmHg</td>
                  <td>{t.lat.toFixed(4)}, {t.lng.toFixed(4)}</td>
                  <td>{t.battery_pct}%</td>
                  <td>{t.button_pressed ? <span className="badge badge-critical">PRESSED</span> : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
