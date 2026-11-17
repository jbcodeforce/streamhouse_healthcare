import { request } from './client'

export interface ScenarioItem {
  id: string
  title: string
  description: string
  cep_fact_table: string
  patient_id: string
  explanation: string
}

export interface ScenarioRunResult {
  success: boolean
  scenario_id: string
  title: string
  cep_fact_table: string
  events_injected: number
  explanation: string
}

export const getScenarios = () => request<ScenarioItem[]>('/scenarios')
export const runScenario = (id: string) =>
  request<ScenarioRunResult>(`/scenarios/${id}/run`, { method: 'POST' })
