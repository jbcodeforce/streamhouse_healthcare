import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCareAreas, deleteCareArea } from '../api/careAreas'
import type { CareArea } from '../types/careArea'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'

export const CareAreasPage: React.FC = () => {
  const [areas, setAreas] = useState<CareArea[]>([])
  const [deleteTarget, setDeleteTarget] = useState<CareArea | null>(null)

  const load = () => {
    getCareAreas().then(setAreas).catch(console.error)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteCareArea(deleteTarget.care_area_id)
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Care Areas & Geofence Perimeters</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Hospital care areas, wards, and GPS radius perimeters
          </p>
        </div>
        <Link to="/care-areas/new" className="btn btn-primary">
          <Plus size={16} /> New Care Area
        </Link>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Care Area ID</th>
                <th>Ward Name</th>
                <th>Facility Type</th>
                <th>Center GPS (Lat, Lng)</th>
                <th>Geofence Radius</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((a) => (
                <tr key={a.care_area_id}>
                  <td><strong>{a.care_area_id}</strong></td>
                  <td>{a.name}</td>
                  <td><span className="badge badge-low">{a.facility_type}</span></td>
                  <td>{a.center_lat.toFixed(4)}, {a.center_lng.toFixed(4)}</td>
                  <td>{a.radius_meters} m</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/care-areas/${a.care_area_id}/edit`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                        <Edit2 size={14} />
                      </Link>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                        onClick={() => setDeleteTarget(a)}
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
        title="Delete Care Area"
        message={`Delete care area ${deleteTarget?.name} (${deleteTarget?.care_area_id})?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
