export interface Patient {
  patient_id: string
  full_name: string
  gender: string
  birth_date: string
  risk_tier: string
  primary_condition: string
  status: string
  created_at?: string
  updated_at?: string
}

export type PatientCreate = Omit<Patient, 'created_at' | 'updated_at'>
export type PatientUpdate = Partial<PatientCreate>
