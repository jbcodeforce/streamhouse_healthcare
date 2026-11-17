import { describe, it, expect, vi, beforeEach } from 'vitest'
import { request, ApiError } from './client'

describe('API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('performs successful GET request and parses JSON', async () => {
    const mockData = [{ patient_id: 'P001', full_name: 'Alice Smith' }]
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    })

    const result = await request<typeof mockData>('/patients')
    expect(result).toEqual(mockData)
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/api/v1/patients', expect.any(Object))
  })

  it('throws ApiError on non-200 responses', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ detail: 'Patient P999 not found' }),
    })

    await expect(request('/patients/P999')).rejects.toThrow(ApiError)
  })

  it('handles 204 No Content correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    })

    const result = await request<void>('/patients/P001', { method: 'DELETE' })
    expect(result).toBeUndefined()
  })
})
