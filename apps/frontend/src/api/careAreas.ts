import { request } from './client'
import type { CareArea, CareAreaCreate, CareAreaUpdate } from '../types/careArea'

export const getCareAreas = () => request<CareArea[]>('/care-areas')
export const getCareArea = (id: string) => request<CareArea>(`/care-areas/${id}`)
export const createCareArea = (data: CareAreaCreate) =>
  request<CareArea>('/care-areas', { method: 'POST', body: JSON.stringify(data) })
export const updateCareArea = (id: string, data: CareAreaUpdate) =>
  request<CareArea>(`/care-areas/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteCareArea = (id: string) =>
  request<void>(`/care-areas/${id}`, { method: 'DELETE' })
