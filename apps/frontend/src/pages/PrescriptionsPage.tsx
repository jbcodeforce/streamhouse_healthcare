import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPrescriptions, deletePrescription } from '../api/prescriptions'
import type { Prescription } from '../types/prescription'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'

export const PrescriptionsPage: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Prescription | null>(null)

  const load = () => {
    getPrescriptions().then(setPrescriptions).catch(console.error)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deletePrescription(deleteTarget.prescription_id)
      setDeleteTarget(null)
      load()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Doctor Prescriptions & Clinical Targets</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Prescription baseline thresholds compared against real-time telemetry in <code>fct_prescription_drift</code>
          </p>
        </div>
        <Link to="/prescriptions/new" className="btn btn-primary">
          <Plus size={16} /> New Prescription
        </Link>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Prescription ID</th>
                <th>Patient ID</th>
                <th>Target Metric</th>
                <th>Min Threshold</th>
                <th>Max Threshold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((rx) => (
                <tr key={rx.prescription_id}>
                  <td><strong>{rx.prescription_id}</strong></td>
                  <td><Link to={`/patients/${rx.patient_id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>{rx.patient_id}</Link></td>
                  <td><span className="badge badge-low">{rx.target_metric}</span></td>
                  <td>{rx.min_threshold}</td>
                  <td>{rx.max_threshold}</td>
                  <td><span className="badge badge-low">{rx.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/prescriptions/${rx.prescription_id}/edit`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                        <Edit2 size={14} />
                      </Link>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                        onClick={() => setDeleteTarget(rx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Prescription"
        message={`Delete prescription ${deleteTarget?.prescription_id} (Patient ${deleteTarget?.patient_id})?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
