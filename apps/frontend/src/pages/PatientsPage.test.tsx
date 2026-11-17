import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PatientsPage } from './PatientsPage'
import * as patientsApi from '../api/patients'

describe('PatientsPage', () => {
  it('loads and renders patients list', async () => {
    vi.spyOn(patientsApi, 'getPatients').mockResolvedValue([
      {
        patient_id: 'P001',
        full_name: 'Alice Smith',
        gender: 'F',
        birth_date: '1980-05-12',
        risk_tier: 'HIGH',
        primary_condition: 'Arrhythmia',
        status: 'ACTIVE',
      },
    ])

    render(
      <BrowserRouter>
        <PatientsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      expect(screen.getByText('P001')).toBeInTheDocument()
      expect(screen.getByText('HIGH')).toBeInTheDocument()
    })
  })
})
