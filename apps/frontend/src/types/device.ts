export interface Device {
  device_id: string
  model_id: string
  serial_number: string
  firmware_version: string
  battery_pct: number
  status: string
  created_at?: string
  updated_at?: string
}

export type DeviceCreate = Omit<Device, 'created_at' | 'updated_at'>
export type DeviceUpdate = Partial<DeviceCreate>
