import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDeviceAssignments, deleteDeviceAssignment } from '../api/deviceAssignments'
import type { DeviceAssignment } from '../types/deviceAssignment'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'

export const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<DeviceAssignment[]>([])
  const [deleteTarget, setDeleteTarget] = useState<DeviceAssignment | null>(null)

  const load = () => {
    getDeviceAssignments().then(setAssignments).catch(console.error)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteDeviceAssignment(deleteTarget.assignment_id)
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Patient-Device Assignments</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Active mapping between patients, medical devices, and hospital care wards
          </p>
        </div>
        <Link to="/device-assignments/new" className="btn btn-primary">
          <Plus size={16} /> New Assignment
        </Link>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Assignment ID</th>
                <th>Patient ID</th>
                <th>Device ID</th>
                <th>Care Area ID</th>
                <th>Bed / Room</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((asg) => (
                <tr key={asg.assignment_id}>
                  <td><strong>{asg.assignment_id}</strong></td>
                  <td><Link to={`/patients/${asg.patient_id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>{asg.patient_id}</Link></td>
                  <td>{asg.device_id}</td>
                  <td>{asg.care_area_id}</td>
                  <td>{asg.bed_label}</td>
                  <td><span className="badge badge-low">{asg.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/device-assignments/${asg.assignment_id}/edit`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                        <Edit2 size={14} />
                      </Link>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                        onClick={() => setDeleteTarget(asg)}
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
        title="Delete Assignment"
        message={`Delete assignment ${deleteTarget?.assignment_id} (Patient ${deleteTarget?.patient_id} <-> Device ${deleteTarget?.device_id})?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
