export type HealthResponse = {
  ok: boolean
  service: string
  time: string
  database: string
  recordCount: number
}

export type RecordItem = {
  id: number
  title: string
  body: string
  created_at: string
  updated_at: string
}

export type RecordsResponse = {
  records: RecordItem[]
}

export type RecordResponse = {
  record: RecordItem
}

export type DeleteResponse = {
  ok: boolean
  id: number
}

export type ConnectionSettings = {
  apiUrl: string
  apiKey: string
}

export type RequestLog = {
  id: number
  at: string
  method: string
  path: string
  status: number | null
  ms: number | null
  ok: boolean
  detail: string
}
