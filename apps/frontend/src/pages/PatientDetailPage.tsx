import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPatient } from '../api/patients'
import { getDeviceAssignments } from '../api/deviceAssignments'
import { getPrescriptions } from '../api/prescriptions'
import { getTelemetryEvents } from '../api/telemetryEvents'
import type { Patient } from '../types/patient'
import type { DeviceAssignment } from '../types/deviceAssignment'
import type { Prescription } from '../types/prescription'
import type { TelemetryEvent } from '../types/telemetryEvent'
import { ArrowLeft, User, FileText, Radio, Link2 } from 'lucide-react'

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [assignments, setAssignments] = useState<DeviceAssignment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([])

  useEffect(() => {
    if (!id) return
    getPatient(id).then(setPatient).catch(console.error)
    getDeviceAssignments(id).then(setAssignments).catch(console.error)
    getPrescriptions(id).then(setPrescriptions).catch(console.error)
    getTelemetryEvents(id, 20).then(setTelemetry).catch(console.error)
  }, [id])

  if (!patient) return <div>Loading patient details...</div>

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/patients" className="btn btn-secondary">
            <ArrowLeft size={16} /> Back
          </Link>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {patient.full_name} ({patient.patient_id})
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Patient Demographics, Active Assignments &amp; Vital Telemetry Stream
            </p>
          </div>
        </div>
        <Link to={`/patients/${patient.patient_id}/edit`} className="btn btn-primary">
          Edit Patient
        </Link>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="#2563eb" /> Demographics &amp; Clinical Profile
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div><strong>Patient ID:</strong> {patient.patient_id}</div>
            <div><strong>Gender:</strong> {patient.gender}</div>
            <div><strong>Birth Date:</strong> {patient.birth_date}</div>
            <div><strong>Risk Tier:</strong> <span className="badge badge-high">{patient.risk_tier}</span></div>
            <div><strong>Primary Condition:</strong> {patient.primary_condition}</div>
            <div><strong>Status:</strong> {patient.status}</div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="#16a34a" /> Active Prescriptions &amp; Targets
          </h2>
          {prescriptions.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No active prescriptions.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {prescriptions.map((rx) => (
                <div key={rx.prescription_id} style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: 4, border: '1px solid var(--border-color)', fontSize: '0.8125rem' }}>
                  <strong>{rx.target_metric}</strong>: Min {rx.min_threshold} - Max {rx.max_threshold} ({rx.status})
                </div>
              ))}
            </div>
          )}

          {assignments.length > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <Link2 size={16} color="#d97706" /> Active Assignment:
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Device: <code>{assignments[0].device_id}</code> | Ward: <code>{assignments[0].care_area_id}</code> ({assignments[0].bed_label})
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Radio size={18} color="#dc2626" /> Recent Vitals Telemetry (Last 20 events)
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Device ID</th>
                <th>Heart Rate</th>
                <th>SpO2</th>
                <th>BP (Sys/Dia)</th>
                <th>Battery</th>
                <th>Alert Button</th>
                <th>Recorded At</th>
              </tr>
            </thead>
            <tbody>
              {telemetry.map((t) => (
                <tr key={t.event_id}>
                  <td><code>{t.event_id}</code></td>
                  <td>{t.device_id}</td>
                  <td><strong>{t.heart_rate} bpm</strong></td>
                  <td>{t.spo2}%</td>
                  <td>{t.systolic_bp} / {t.diastolic_bp}</td>
                  <td>{t.battery_pct}%</td>
                  <td>{t.button_pressed ? <span className="badge badge-critical">PRESSED</span> : 'No'}</td>
                  <td>{t.created_at || 'Live Stream'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
