import { API_BASE_URL } from '../config'

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(`API Error ${status}: ${detail}`)
    this.name = 'ApiError'
  }
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers(options?.headers)
  if (!headers.has('Content-Type') && options?.body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const data = await response.json()
      if (data && typeof data === 'object' && 'detail' in data) {
        detail = String(data.detail)
      }
    } catch {
      // ignore
    }
    throw new ApiError(response.status, detail)
  }

  if (response.status === 204) {
    return undefined as unknown as T
  }

  return response.json() as Promise<T>
}
