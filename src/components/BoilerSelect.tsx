import type { Boiler } from '../api/types'

type Props = {
  boilers: Boiler[]
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export function BoilerSelect({ boilers, value, onChange, required }: Props) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} required={required}>
      <option value="">{required ? 'Select a boiler…' : 'Not boiler-specific'}</option>
      {boilers.map((boiler) => (
        <option key={boiler.id} value={String(boiler.id)}>
          No. {boiler.number} · {boiler.type}
          {boiler.location ? ` · ${boiler.location}` : ''}
        </option>
      ))}
    </select>
  )
}
