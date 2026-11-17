import { request } from './client'
import type { Patient, PatientCreate, PatientUpdate } from '../types/patient'

export const getPatients = () => request<Patient[]>('/patients')
export const getPatient = (id: string) => request<Patient>(`/patients/${id}`)
export const createPatient = (data: PatientCreate) =>
  request<Patient>('/patients', { method: 'POST', body: JSON.stringify(data) })
export const updatePatient = (id: string, data: PatientUpdate) =>
  request<Patient>(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deletePatient = (id: string) =>
  request<void>(`/patients/${id}`, { method: 'DELETE' })
