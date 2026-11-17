import { request } from './client'
import type { DeviceAssignment, DeviceAssignmentCreate, DeviceAssignmentUpdate } from '../types/deviceAssignment'

export const getDeviceAssignments = (patientId?: string) =>
  request<DeviceAssignment[]>(patientId ? `/device-assignments?patient_id=${patientId}` : '/device-assignments')
export const getDeviceAssignment = (id: string) => request<DeviceAssignment>(`/device-assignments/${id}`)
export const createDeviceAssignment = (data: DeviceAssignmentCreate) =>
  request<DeviceAssignment>('/device-assignments', { method: 'POST', body: JSON.stringify(data) })
export const updateDeviceAssignment = (id: string, data: DeviceAssignmentUpdate) =>
  request<DeviceAssignment>(`/device-assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteDeviceAssignment = (id: string) =>
  request<void>(`/device-assignments/${id}`, { method: 'DELETE' })
