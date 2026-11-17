import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getDeviceAssignment, createDeviceAssignment, updateDeviceAssignment } from '../api/deviceAssignments'
import type { DeviceAssignmentCreate } from '../types/deviceAssignment'
import { ArrowLeft, Save } from 'lucide-react'

export const AssignmentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState<DeviceAssignmentCreate>({
    assignment_id: '',
    patient_id: '',
    device_id: '',
    care_area_id: 'CA-ICU-01',
    bed_label: 'BED-101',
    status: 'ACTIVE',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      getDeviceAssignment(id)
        .then((asg) => {
          setFormData({
            assignment_id: asg.assignment_id,
            patient_id: asg.patient_id,
            device_id: asg.device_id,
            care_area_id: asg.care_area_id,
            bed_label: asg.bed_label,
            status: asg.status,
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
        await updateDeviceAssignment(id, formData)
      } else {
        await createDeviceAssignment(formData)
      }
      navigate('/device-assignments')
    } catch (err: any) {
      setError(err.detail || err.message)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/device-assignments" className="btn btn-secondary">
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {isEdit ? `Edit Assignment (${id})` : 'New Patient-Device Assignment'}
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
              Assignment ID (e.g. ASG-006)
            </label>
            <input
              type="text"
              required
              disabled={isEdit}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
              value={formData.assignment_id}
              onChange={(e) => setFormData({ ...formData, assignment_id: e.target.value })}
            />
          </div>

          <div className="grid-2">
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
                Device ID (e.g. DEV-P001)
              </label>
              <input
                type="text"
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                value={formData.device_id}
                onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Care Area ID
              </label>
              <input
                type="text"
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                value={formData.care_area_id}
                onChange={(e) => setFormData({ ...formData, care_area_id: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Bed / Location Label
              </label>
              <input
                type="text"
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                value={formData.bed_label}
                onChange={(e) => setFormData({ ...formData, bed_label: e.target.value })}
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
              <option value="RELEASED">RELEASED</option>
              <option value="TRANSFERRED">TRANSFERRED</option>
            </select>
          </div>

          <button className="btn btn-primary" type="submit">
            <Save size={16} /> {isEdit ? 'Save Changes' : 'Create Assignment'}
          </button>
        </form>
      </div>
    </div>
  )
}
