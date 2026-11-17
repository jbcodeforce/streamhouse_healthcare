export interface DeviceAssignment {
  assignment_id: string
  patient_id: string
  device_id: string
  care_area_id: string
  bed_label: string
  status: string
  created_at?: string
  updated_at?: string
}

export type DeviceAssignmentCreate = Omit<DeviceAssignment, 'created_at' | 'updated_at'>
export type DeviceAssignmentUpdate = Partial<DeviceAssignmentCreate>
