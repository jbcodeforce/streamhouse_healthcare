import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getPrescription, createPrescription, updatePrescription } from '../api/prescriptions'
import type { PrescriptionCreate } from '../types/prescription'
import { ArrowLeft, Save } from 'lucide-react'

export const PrescriptionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState<PrescriptionCreate>({
    prescription_id: '',
    patient_id: '',
    target_metric: 'HEART_RATE',
    min_threshold: 60.0,
    max_threshold: 100.0,
    status: 'ACTIVE',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      getPrescription(id)
        .then((rx) => {
          setFormData({
            prescription_id: rx.prescription_id,
            patient_id: rx.patient_id,
            target_metric: rx.target_metric,
            min_threshold: rx.min_threshold,
            max_threshold: rx.max_threshold,
            status: rx.status,
          })
        })
        .catch((err) => setError(err.message))
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (isEdit && id) {
        await updatePrescription(id, formData)
      } else {
        await createPrescription(formData)
      }
      navigate('/prescriptions')
    } catch (err: any) {
      setError(err.detail || err.message)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/prescriptions" className="btn btn-secondary">
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {isEdit ? `Edit Prescription (${id})` : 'New Doctor Prescription'}
          </h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        {error && (
          <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Prescription ID (e.g. RX-P006)
            </label>
            <input
              type="text"
              required
              disabled={isEdit}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
              value={formData.prescription_id}
              onChange={(e) => setFormData({ ...formData, prescription_id: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Patient ID (e.g. P001)
            </label>
            <input
              type="text"
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Target Metric
            </label>
            <select
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
              value={formData.target_metric}
              onChange={(e) => setFormData({ ...formData, target_metric: e.target.value })}
            >
              <option value="HEART_RATE">HEART_RATE (BPM)</option>
              <option value="SPO2">SPO2 (Blood Oxygen %)</option>
              <option value="SYSTOLIC_BP">SYSTOLIC_BP (mmHg)</option>
            </select>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Min Threshold
              </label>
              <input
                type="number"
                step="any"
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                value={formData.min_threshold}
                onChange={(e) => setFormData({ ...formData, min_threshold: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Max Threshold
              </label>
              <input
                type="number"
                step="any"
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                value={formData.max_threshold}
                onChange={(e) => setFormData({ ...formData, max_threshold: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Status
            </label>
            <select
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <button className="btn btn-primary" type="submit">
            <Save size={16} /> {isEdit ? 'Save Changes' : 'Create Prescription'}
          </button>
        </form>
      </div>
    </div>
  )
}
