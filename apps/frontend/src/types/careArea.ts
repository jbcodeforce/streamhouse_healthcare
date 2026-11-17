export interface CareArea {
  care_area_id: string
  name: string
  facility_type: string
  center_lat: number
  center_lng: number
  radius_meters: number
  created_at?: string
  updated_at?: string
}

export type CareAreaCreate = Omit<CareArea, 'created_at' | 'updated_at'>
export type CareAreaUpdate = Partial<CareAreaCreate>
