import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApiError, getHealth } from '../api/client'
import type { ConnectionSettings, HealthResponse, RequestLog } from '../api/types'
import { loadSettings, saveSettings } from '../config'

type ConnectionState = {
  settings: ConnectionSettings
  health: HealthResponse | null
  lastError: string | null
  lastMs: number | null
  checking: boolean
  log: RequestLog[]
  setSettings: (next: ConnectionSettings) => void
  ping: () => Promise<boolean>
  pushLog: (entry: Omit<RequestLog, 'id' | 'at'>) => void
  clearLog: () => void
}

const ConnectionContext = createContext<ConnectionState | null>(null)

let logId = 0

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<ConnectionSettings>(() => loadSettings())
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const [lastMs, setLastMs] = useState<number | null>(null)
  const [checking, setChecking] = useState(false)
  const [log, setLog] = useState<RequestLog[]>([])

  const setSettings = useCallback((next: ConnectionSettings) => {
    const cleaned = { apiUrl: next.apiUrl.trim(), apiKey: next.apiKey }
    saveSettings(cleaned)
    setSettingsState(cleaned)
  }, [])

  const pushLog = useCallback((entry: Omit<RequestLog, 'id' | 'at'>) => {
    const item: RequestLog = {
      ...entry,
      id: ++logId,
      at: new Date().toISOString(),
    }
    setLog((current) => [item, ...current].slice(0, 40))
  }, [])

  const clearLog = useCallback(() => setLog([]), [])

  const ping = useCallback(async () => {
    setChecking(true)
    try {
      const result = await getHealth()
      setHealth(result.data)
      setLastError(null)
      setLastMs(result.ms)
      pushLog({
        method: result.method,
        path: result.path,
        status: result.status,
        ms: result.ms,
        ok: true,
        detail: `${result.data.database}, ${result.data.recordCount} rows`,
      })
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Health check failed'
      const status = error instanceof ApiError ? error.status : 0
      setHealth(null)
      setLastError(message)
      setLastMs(null)
      pushLog({
        method: 'GET',
        path: '/api/health',
        status: status || null,
        ms: null,
        ok: false,
        detail: message,
      })
      return false
    } finally {
      setChecking(false)
    }
  }, [pushLog])

  const value = useMemo(
    () => ({
      settings,
      health,
      lastError,
      lastMs,
      checking,
      log,
      setSettings,
      ping,
      pushLog,
      clearLog,
    }),
    [settings, health, lastError, lastMs, checking, log, setSettings, ping, pushLog, clearLog],
  )

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>
}

export function useConnection() {
  const value = useContext(ConnectionContext)
  if (!value) {
    throw new Error('useConnection must be used inside ConnectionProvider')
  }
  return value
}
