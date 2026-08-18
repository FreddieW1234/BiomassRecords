import { loadSettings } from '../config'
import type {
  DeleteResponse,
  HealthResponse,
  RecordItem,
  RecordResponse,
  RecordsResponse,
} from './types'

export class ApiError extends Error {
  status: number
  path: string

  constructor(message: string, status: number, path: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.path = path
  }
}

export type ApiResult<T> = {
  data: T
  status: number
  ms: number
  path: string
  method: string
}

function joinUrl(base: string, path: string) {
  return `${base.replace(/\/$/, '')}${path}`
}

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const { apiUrl, apiKey } = loadSettings()
  if (!apiUrl) {
    throw new ApiError(
      'No API URL set. Paste the Cloudflare tunnel hostname in Connection Lab.',
      0,
      path,
    )
  }

  const method = (init.method || 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (apiKey) {
    headers.set('X-API-Key', apiKey)
  }

  const url = joinUrl(apiUrl, path)
  const started = performance.now()
  let response: Response
  try {
    response = await fetch(url, { ...init, method, headers })
  } catch {
    throw new ApiError(
      `Could not reach ${url}. The tunnel may be down, the URL may be wrong, or CORS is blocking this origin.`,
      0,
      path,
    )
  }

  const ms = Math.round(performance.now() - started)
  const text = await response.text()
  let parsed: unknown = null
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown
    } catch {
      throw new ApiError(`Non-JSON response from ${path}`, response.status, path)
    }
  }

  if (!response.ok) {
    const message =
      parsed && typeof parsed === 'object' && 'error' in parsed
        ? String((parsed as { error: unknown }).error)
        : `Request failed (${response.status})`
    const error = new ApiError(message, response.status, path)
    Object.assign(error, { ms })
    throw error
  }

  return { data: parsed as T, status: response.status, ms, path, method }
}

export function getHealth() {
  return request<HealthResponse>('/api/health')
}

export function listRecords() {
  return request<RecordsResponse>('/api/records')
}

export function createRecord(payload: Pick<RecordItem, 'title' | 'body'>) {
  return request<RecordResponse>('/api/records', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateRecord(id: number, payload: Pick<RecordItem, 'title' | 'body'>) {
  return request<RecordResponse>(`/api/records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteRecord(id: number) {
  return request<DeleteResponse>(`/api/records/${id}`, { method: 'DELETE' })
}
