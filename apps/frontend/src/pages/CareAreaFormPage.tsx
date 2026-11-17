import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCareArea, createCareArea, updateCareArea } from '../api/careAreas'
import type { CareAreaCreate } from '../types/careArea'
import { ArrowLeft, Save } from 'lucide-react'

export const CareAreaFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState<CareAreaCreate>({
    care_area_id: '',
    name: '',
    facility_type: 'WARD',
    center_lat: 41.8781,
    center_lng: -87.6298,
    radius_meters: 500.0,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      getCareArea(id)
        .then((a) => {
          setFormData({
            care_area_id: a.care_area_id,
            name: a.name,
            facility_type: a.facility_type,
            center_lat: a.center_lat,
            center_lng: a.center_lng,
            radius_meters: a.radius_meters,
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
        await updateCareArea(id, formData)
      } else {
        await createCareArea(formData)
      }
      navigate('/care-areas')
    } catch (err: any) {
      setError(err.detail || err.message)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/care-areas" className="btn btn-secondary">
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {isEdit ? `Edit Care Area (${id})` : 'New Care Area'}
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
              Care Area ID (e.g. CA-ICU-02)
            </label>
            <input
              type="text"
              required
              disabled={isEdit}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
              value={formData.care_area_id}
              onChange={(e) => setFormData({ ...formData, care_area_id: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Ward / Facility Name
            </label>
            <input
              type="text"
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Facility Type
            </label>
            <select
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
              value={formData.facility_type}
              onChange={(e) => setFormData({ ...formData, facility_type: e.target.value })}
            >
              <option value="ICU">ICU</option>
              <option value="CARDIOLOGY">CARDIOLOGY</option>
              <option value="GENERAL">GENERAL</option>
              <option value="REHAB">REHAB</option>
              <option value="WARD">WARD</option>
            </select>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Center Latitude
              </label>
              <input
                type="number"
                step="any"
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                value={formData.center_lat}
                onChange={(e) => setFormData({ ...formData, center_lat: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Center Longitude
              </label>
              <input
                type="number"
                step="any"
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                value={formData.center_lng}
                onChange={(e) => setFormData({ ...formData, center_lng: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Geofence Radius (Meters)
            </label>
            <input
              type="number"
              step="any"
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
              value={formData.radius_meters}
              onChange={(e) => setFormData({ ...formData, radius_meters: parseFloat(e.target.value) })}
            />
          </div>

          <button className="btn btn-primary" type="submit">
            <Save size={16} /> {isEdit ? 'Save Changes' : 'Create Care Area'}
          </button>
        </form>
      </div>
    </div>
  )
}
