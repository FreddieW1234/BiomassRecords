import { boilersApi, metersApi } from '../api/client'
import type { Meter } from '../api/types'
import { RecordPage } from '../components/RecordPage'
import { useList } from '../hooks/useList'
import { boilerLabel, showDate } from '../lib/format'

const empty = () => ({
  boiler_id: '',
  serial_number: '',
  meter_type: '',
  location: '',
  commissioned_on: '',
  commissioning_reading: '',
  replaced_on: '',
  notes: '',
})

export function Meters() {
  const { items: boilers, byId } = useList(boilersApi)

  return (
    <RecordPage<Meter>
      title="Meters"
      blurb="Heat and fuel meters linked to a boiler. Readings can optionally point at one of these."
      tableTitle="Meters"
      api={metersApi}
      empty={empty}
      toForm={(item) => ({
        boiler_id: String(item.boiler_id),
        serial_number: item.serial_number,
        meter_type: item.meter_type,
        location: item.location,
        commissioned_on: item.commissioned_on,
        commissioning_reading: item.commissioning_reading ? String(item.commissioning_reading) : '',
        replaced_on: item.replaced_on,
        notes: item.notes,
      })}
      fields={[
        {
          name: 'boiler_id',
          label: 'Boiler',
          kind: 'select',
          required: true,
          options: boilers.map((boiler) => ({
            value: String(boiler.id),
            label: boilerLabel(boiler),
          })),
        },
        { name: 'serial_number', label: 'Serial number', required: true, width: 'half' },
        { name: 'meter_type', label: 'Meter type', placeholder: 'Heat, electricity…', width: 'half' },
        { name: 'location', label: 'Location' },
        { name: 'commissioned_on', label: 'Commissioned', kind: 'date', width: 'half' },
        { name: 'commissioning_reading', label: 'Commissioning reading', kind: 'number', width: 'half' },
        { name: 'replaced_on', label: 'Replaced', kind: 'date' },
        { name: 'notes', label: 'Notes', kind: 'textarea', rows: 2 },
      ]}
      columns={[
        { header: 'Serial', className: 'nowrap', cell: (item) => item.serial_number },
        { header: 'Boiler', className: 'nowrap', cell: (item) => boilerLabel(byId.get(item.boiler_id)) },
        { header: 'Type', cell: (item) => item.meter_type || '—' },
        { header: 'Commissioned', className: 'nowrap', cell: (item) => showDate(item.commissioned_on) },
      ]}
      hint={boilers.length === 0 ? 'Add a boiler first.' : undefined}
    />
  )
}