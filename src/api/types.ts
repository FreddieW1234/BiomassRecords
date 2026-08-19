export type HealthResponse = {
  ok: boolean
  service: string
  time: string
  database: string
  boilerCount: number
  cleaningCount: number
  maintenanceCount: number
  meterReadingCount: number
  earningCount: number
}

type Timestamps = {
  id: number
  created_at: string
  updated_at: string
}

export type Boiler = Timestamps & {
  number: string
  type: string
  location: string
  notes: string
}

export type CleaningEntry = Timestamps & {
  date: string
  staff: string
  boiler_id: number | null
  work_done: string
  duration: string
  next_due: string
}

export type MaintenanceEntry = Timestamps & {
  date: string
  staff: string
  boiler_id: number | null
  work_done: string
  duration: string
  next_due: string
}

export type MeterReading = Timestamps & {
  date: string
  boiler_id: number
  reading: number
  staff: string
  notes: string
}

export type EarningEntry = Timestamps & {
  date: string
  scheme: string
  amount: number
  boiler_id: number | null
  notes: string
}

export type ListResponse<T> = { items: T[] }
export type ItemResponse<T> = { item: T }
export type DeleteResponse = { ok: boolean; id: number }

export type ConnectionSettings = {
  apiUrl: string
  apiKey: string
}
