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
