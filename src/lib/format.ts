import type { Boiler } from '../api/types'

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function showDate(value: string) {
  if (!value) return '—'
  const [y, m, d] = value.split('-')
  return `${d}/${m}/${y}`
}

const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export function money(value: number) {
  return gbp.format(value)
}

const num = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 })

export function figure(value: number) {
  return num.format(value)
}

export function boilerLabel(boiler: Boiler | undefined | null) {
  if (!boiler) return '—'
  return `No. ${boiler.number} · ${boiler.type}`
}

export function boilerMap(boilers: Boiler[]) {
  const map = new Map<number, Boiler>()
  for (const boiler of boilers) map.set(boiler.id, boiler)
  return map
}

export function idValue(value: number | null | undefined) {
  return value == null ? '' : String(value)
}

export function namedMap<T extends { id: number }>(items: T[]) {
  const map = new Map<number, T>()
  for (const item of items) map.set(item.id, item)
  return map
}

export function recordLabel(item: Record<string, unknown> | undefined | null) {
  if (!item) return '—'
  const id = Number(item.id)
  if (item.number != null && String(item.number) && item.type) {
    return `No. ${String(item.number)} · ${String(item.type)}`
  }
  if (typeof item.name === 'string' && item.name) return item.name
  if (typeof item.title === 'string' && item.title) return item.title
  if (typeof item.serial_number === 'string' && item.serial_number) return item.serial_number
  if (typeof item.date === 'string' && item.date) return `${showDate(item.date)} (#${id})`
  return `#${id}`
}
