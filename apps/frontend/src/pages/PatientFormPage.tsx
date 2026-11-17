import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getPatient, createPatient, updatePatient } from '../api/patients'
import type { PatientCreate } from '../types/patient'
import { ArrowLeft, Save } from 'lucide-react'

export const PatientFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState<PatientCreate>({
    patient_id: '',
    full_name: '',
    gender: 'M',
    birth_date: '1980-01-01',
    risk_tier: 'LOW',
    primary_condition: 'General Observation',
    status: 'ACTIVE',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      getPatient(id)
        .then((p) => {
          setFormData({
            patient_id: p.patient_id,
            full_name: p.full_name,
            gender: p.gender,
            birth_date: p.birth_date,
            risk_tier: p.risk_tier,
            primary_condition: p.primary_condition,
            status: p.status,
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
        await updatePatient(id, formData)
      } else {
        await createPatient(formData)
      }
      navigate('/patients')
    } catch (err: any) {
      setError(err.detail || err.message)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/patients" className="btn btn-secondary">
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {isEdit ? `Edit Patient (${id})` : 'New Patient'}
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
              Patient ID (e.g. P006)
            </label>
            <input
              type="text"
              required
              disabled={isEdit}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Full Name
            </label>
            <input
              type="text"
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Gender
              </label>
              <select
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="M">Male (M)</option>
                <option value="F">Female (F)</option>
                <option value="U">Other (U)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Birth Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Risk Tier
              </label>
              <select
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                value={formData.risk_tier}
                onChange={(e) => setFormData({ ...formData, risk_tier: e.target.value })}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
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
                <option value="DISCHARGED">DISCHARGED</option>
                <option value="TRANSFERRED">TRANSFERRED</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Primary Medical Condition
            </label>
            <input
              type="text"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
              value={formData.primary_condition}
              onChange={(e) => setFormData({ ...formData, primary_condition: e.target.value })}
            />
          </div>

          <button className="btn btn-primary" type="submit" style={{ marginTop: '0.5rem' }}>
            <Save size={16} /> {isEdit ? 'Save Changes' : 'Create Patient'}
          </button>
        </form>
      </div>
    </div>
  )
}
