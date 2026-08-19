import { loadSettings } from '../config'
import type {
  Boiler,
  CleaningEntry,
  DeleteResponse,
  EarningEntry,
  HealthResponse,
  ItemResponse,
  ListResponse,
  MaintenanceEntry,
  MeterReading,
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
    throw new ApiError('No API URL configured in this build.', 0, path)
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
      'Could not reach the office server. Check your connection and try again.',
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
    throw new ApiError(message, response.status, path)
  }

  return { data: parsed as T, status: response.status, ms, path, method }
}

export function getHealth() {
  return request<HealthResponse>('/api/health')
}

export type Resource<TItem> = {
  list: () => Promise<ApiResult<ListResponse<TItem>>>
  create: (payload: Record<string, unknown>) => Promise<ApiResult<ItemResponse<TItem>>>
  update: (id: number, payload: Record<string, unknown>) => Promise<ApiResult<ItemResponse<TItem>>>
  remove: (id: number) => Promise<ApiResult<DeleteResponse>>
}

function resource<TItem>(base: string): Resource<TItem> {
  return {
    list: () => request<ListResponse<TItem>>(base),
    create: (payload) =>
      request<ItemResponse<TItem>>(base, { method: 'POST', body: JSON.stringify(payload) }),
    update: (id, payload) =>
      request<ItemResponse<TItem>>(`${base}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    remove: (id) => request<DeleteResponse>(`${base}/${id}`, { method: 'DELETE' }),
  }
}

export const boilersApi = resource<Boiler>('/api/boilers')
export const cleaningApi = resource<CleaningEntry>('/api/cleaning')
export const maintenanceApi = resource<MaintenanceEntry>('/api/maintenance')
export const meterReadingsApi = resource<MeterReading>('/api/meter-readings')
export const earningsApi = resource<EarningEntry>('/api/earnings')
