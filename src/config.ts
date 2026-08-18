import type { ConnectionSettings } from './api/types'

const URL_KEY = 'biomassrecords.apiUrl'
const KEY_KEY = 'biomassrecords.apiKey'

function envUrl() {
  return (import.meta.env.VITE_API_URL as string | undefined)?.trim() || ''
}

function envKey() {
  return (import.meta.env.VITE_API_KEY as string | undefined)?.trim() || ''
}

export function loadSettings(): ConnectionSettings {
  return {
    apiUrl: window.localStorage.getItem(URL_KEY)?.trim() || envUrl(),
    apiKey: window.localStorage.getItem(KEY_KEY) ?? envKey(),
  }
}

export function saveSettings(settings: ConnectionSettings) {
  window.localStorage.setItem(URL_KEY, settings.apiUrl.trim())
  window.localStorage.setItem(KEY_KEY, settings.apiKey)
}

export function originLabel() {
  return window.location.origin
}
