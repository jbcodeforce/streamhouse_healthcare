import { request } from './client'
import type { Device, DeviceCreate, DeviceUpdate } from '../types/device'

export const getDevices = () => request<Device[]>('/devices')
export const getDevice = (id: string) => request<Device>(`/devices/${id}`)
export const createDevice = (data: DeviceCreate) =>
  request<Device>('/devices', { method: 'POST', body: JSON.stringify(data) })
export const updateDevice = (id: string, data: DeviceUpdate) =>
  request<Device>(`/devices/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteDevice = (id: string) =>
  request<void>(`/devices/${id}`, { method: 'DELETE' })
