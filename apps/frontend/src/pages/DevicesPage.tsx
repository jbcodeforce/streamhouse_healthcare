import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDevices, deleteDevice } from '../api/devices'
import type { Device } from '../types/device'
import { Plus, Trash2, Edit2, Battery } from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'

export const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Device | null>(null)

  const load = () => {
    getDevices().then(setDevices).catch(console.error)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteDevice(deleteTarget.device_id)
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Medical Devices Inventory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Pulse oximeters, smart ECG monitors, and smart beds
          </p>
        </div>
        <Link to="/devices/new" className="btn btn-primary">
          <Plus size={16} /> New Device
        </Link>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Model ID</th>
                <th>Serial Number</th>
                <th>Firmware</th>
                <th>Battery Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.device_id}>
                  <td><strong>{d.device_id}</strong></td>
                  <td>{d.model_id}</td>
                  <td>{d.serial_number}</td>
                  <td><code>{d.firmware_version}</code></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Battery size={16} color={d.battery_pct < 20 ? 'var(--danger)' : 'var(--success)'} />
                      <span>{d.battery_pct}%</span>
                    </div>
                  </td>
                  <td><span className="badge badge-low">{d.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/devices/${d.device_id}/edit`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                        <Edit2 size={14} />
                      </Link>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                        onClick={() => setDeleteTarget(d)}
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
        title="Delete Medical Device"
        message={`Delete device ${deleteTarget?.device_id} (${deleteTarget?.serial_number})?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
