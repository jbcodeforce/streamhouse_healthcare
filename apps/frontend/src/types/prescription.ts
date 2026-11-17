export interface Prescription {
  prescription_id: string
  patient_id: string
  target_metric: string
  min_threshold: number
  max_threshold: number
  status: string
  created_at?: string
  updated_at?: string
}

export type PrescriptionCreate = Omit<Prescription, 'created_at' | 'updated_at'>
export type PrescriptionUpdate = Partial<PrescriptionCreate>
