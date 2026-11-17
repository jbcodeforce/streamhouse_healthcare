import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPatients, deletePatient } from '../api/patients'
import type { Patient } from '../types/patient'
import { Plus, Trash2, Edit2, Eye } from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)

  const load = () => {
    getPatients().then(setPatients).catch(console.error)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deletePatient(deleteTarget.patient_id)
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Patients Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            PostgreSQL operational table <code>patients</code> (CDC captured to <code>cdc.public.patients</code>)
          </p>
        </div>
        <Link to="/patients/new" className="btn btn-primary">
          <Plus size={16} /> New Patient
        </Link>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Full Name</th>
                <th>Gender / DOB</th>
                <th>Risk Tier</th>
                <th>Primary Condition</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => {
                let badgeClass = 'badge-low'
                if (p.risk_tier === 'MEDIUM') badgeClass = 'badge-medium'
                if (p.risk_tier === 'HIGH') badgeClass = 'badge-high'
                if (p.risk_tier === 'CRITICAL') badgeClass = 'badge-critical'

                return (
                  <tr key={p.patient_id}>
                    <td><strong>{p.patient_id}</strong></td>
                    <td>{p.full_name}</td>
                    <td>{p.gender} ({p.birth_date})</td>
                    <td><span className={`badge ${badgeClass}`}>{p.risk_tier}</span></td>
                    <td>{p.primary_condition}</td>
                    <td><span className="badge badge-low">{p.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/patients/${p.patient_id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} title="View">
                          <Eye size={14} />
                        </Link>
                        <Link to={`/patients/${p.patient_id}/edit`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} title="Edit">
                          <Edit2 size={14} />
                        </Link>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                          onClick={() => setDeleteTarget(p)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Patient"
        message={`Are you sure you want to delete patient ${deleteTarget?.full_name} (${deleteTarget?.patient_id})? This CDC deletion event will cascade to Flink.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
