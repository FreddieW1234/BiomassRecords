import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getHealth } from '../api/client'
import type { HealthResponse } from '../api/types'

type ConnectionState = {
  health: HealthResponse | null
  lastError: string | null
  lastMs: number | null
  checking: boolean
  ping: () => Promise<boolean>
}

const ConnectionContext = createContext<ConnectionState | null>(null)

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const [lastMs, setLastMs] = useState<number | null>(null)
  const [checking, setChecking] = useState(false)

  const ping = useCallback(async () => {
    setChecking(true)
    try {
      const result = await getHealth()
      setHealth(result.data)
      setLastError(null)
      setLastMs(result.ms)
      return true
    } catch (error) {
      setHealth(null)
      setLastError(error instanceof Error ? error.message : 'Health check failed')
      setLastMs(null)
      return false
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    void ping()
  }, [ping])

  const value = useMemo(
    () => ({ health, lastError, lastMs, checking, ping }),
    [health, lastError, lastMs, checking, ping],
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
