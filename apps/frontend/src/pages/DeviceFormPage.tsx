import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getDevice, createDevice, updateDevice } from '../api/devices'
import type { DeviceCreate } from '../types/device'
import { ArrowLeft, Save } from 'lucide-react'

export const DeviceFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState<DeviceCreate>({
    device_id: '',
    model_id: 'MOD-OX-100',
    serial_number: '',
    firmware_version: 'v1.0.0',
    battery_pct: 100,
    status: 'AVAILABLE',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      getDevice(id)
        .then((d) => {
          setFormData({
            device_id: d.device_id,
            model_id: d.model_id,
            serial_number: d.serial_number,
            firmware_version: d.firmware_version,
            battery_pct: d.battery_pct,
            status: d.status,
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
        await updateDevice(id, formData)
      } else {
        await createDevice(formData)
      }
      navigate('/devices')
    } catch (err: any) {
      setError(err.detail || err.message)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/devices" className="btn btn-secondary">
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {isEdit ? `Edit Device (${id})` : 'New Medical Device'}
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
              Device ID (e.g. DEV-SPARE-02)
            </label>
            <input
              type="text"
              required
              disabled={isEdit}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
              value={formData.device_id}
              onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Model
              </label>
              <select
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                value={formData.model_id}
                onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
              >
                <option value="MOD-OX-100">MOD-OX-100 (PulseOx Pro)</option>
                <option value="MOD-ECG-200">MOD-ECG-200 (SmartECG Bio)</option>
                <option value="MOD-BED-500">MOD-BED-500 (CareBed Smart)</option>
                <option value="MOD-PUMP-300">MOD-PUMP-300 (InfuGuard)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Serial Number
              </label>
              <input
                type="text"
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Firmware Version
              </label>
              <input
                type="text"
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                value={formData.firmware_version}
                onChange={(e) => setFormData({ ...formData, firmware_version: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Battery (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                value={formData.battery_pct}
                onChange={(e) => setFormData({ ...formData, battery_pct: parseInt(e.target.value) || 0 })}
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
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>

          <button className="btn btn-primary" type="submit">
            <Save size={16} /> {isEdit ? 'Save Changes' : 'Create Device'}
          </button>
        </form>
      </div>
    </div>
  )
}
