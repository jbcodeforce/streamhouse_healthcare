import { request } from './client'
import type { Prescription, PrescriptionCreate, PrescriptionUpdate } from '../types/prescription'

export const getPrescriptions = (patientId?: string) =>
  request<Prescription[]>(patientId ? `/prescriptions?patient_id=${patientId}` : '/prescriptions')
export const getPrescription = (id: string) => request<Prescription>(`/prescriptions/${id}`)
export const createPrescription = (data: PrescriptionCreate) =>
  request<Prescription>('/prescriptions', { method: 'POST', body: JSON.stringify(data) })
export const updatePrescription = (id: string, data: PrescriptionUpdate) =>
  request<Prescription>(`/prescriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deletePrescription = (id: string) =>
  request<void>(`/prescriptions/${id}`, { method: 'DELETE' })
