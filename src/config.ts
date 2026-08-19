import type { ConnectionSettings } from './api/types'

// Settings are baked in at build time (VITE_* env vars on Render). The old
// localStorage override from the Connection Lab days is deliberately gone —
// clear any stale saved URL so it can't shadow the real one.
const LEGACY_KEYS = ['biomassrecords.apiUrl', 'biomassrecords.apiKey']
for (const key of LEGACY_KEYS) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // storage unavailable; nothing to clean
  }
}

export function loadSettings(): ConnectionSettings {
  return {
    apiUrl: (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '',
    apiKey: (import.meta.env.VITE_API_KEY as string | undefined)?.trim() || '',
  }
}
