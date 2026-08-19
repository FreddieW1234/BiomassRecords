import { type FormEvent, type ReactNode } from 'react'
import type { Resource } from '../api/client'
import { useLedger } from '../hooks/useLedger'

export type RecordField = {
  name: string
  label: string
  kind?: 'text' | 'textarea' | 'date' | 'number' | 'select'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  emptyLabel?: string
  width?: 'half'
  rows?: number
  list?: string
  listValues?: string[]
  step?: string
}

export type RecordColumn<T> = {
  header: string
  className?: string
  cell: (item: T) => ReactNode
}

type Props<T extends { id: number }> = {
  title: string
  blurb: string
  tableTitle?: string
  api: Resource<T>
  empty: () => Record<string, string>
  toForm: (item: T) => Record<string, string>
  fields: RecordField[]
  columns: RecordColumn<T>[]
  hint?: string
}

export function RecordPage<T extends { id: number }>({
  title,
  blurb,
  tableTitle = 'Records',
  api,
  empty,
  toForm,
  fields,
  columns,
  hint,
}: Props<T>) {
  const ledger = useLedger<T, Record<string, string>>({ api, empty, toForm })

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void ledger.submit()
  }

  const rows: RecordField[][] = []
  for (const field of fields) {
    const last = rows.at(-1)
    if (field.width === 'half' && last?.length === 1 && last[0].width === 'half') {
      last.push(field)
    } else {
      rows.push([field])
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>{title}</h1>
        <p>{blurb}</p>
      </div>

      <div className="split">
        <form className="card form-card" onSubmit={onSubmit}>
          <h2>{ledger.editingId ? `Edit #${ledger.editingId}` : 'New record'}</h2>
          {rows.map((row, index) => {
            const inner = row.map((field) => (
              <Field
                key={field.name}
                field={field}
                value={ledger.form[field.name] ?? ''}
                onChange={(value) => ledger.setField(field.name, value)}
              />
            ))
            if (row.length === 2) {
              return (
                <div className="field-row" key={row.map((f) => f.name).join('-')}>
                  {inner}
                </div>
              )
            }
            return <div key={row[0]?.name ?? index}>{inner}</div>
          })}
          <div className="row">
            <button type="submit" className="button" disabled={ledger.saving}>
              {ledger.editingId ? 'Save changes' : 'Add record'}
            </button>
            {ledger.editingId && (
              <button type="button" className="button ghost" onClick={ledger.cancel}>
                Cancel
              </button>
            )}
          </div>
          {ledger.error && <p className="err">{ledger.error}</p>}
          {hint && <p className="hint">{hint}</p>}
        </form>

        <section className="card">
          <div className="card-head">
            <h2>{tableTitle}</h2>
            <span className="count">{ledger.items.length}</span>
          </div>
          {ledger.loading ? (
            <p className="muted">Loading…</p>
          ) : ledger.items.length === 0 ? (
            <p className="muted">Nothing recorded yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="ledger">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.header} className={column.className}>
                        {column.header}
                      </th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {ledger.items.map((item) => (
                    <tr key={item.id}>
                      {columns.map((column) => (
                        <td key={column.header} className={column.className}>
                          {column.cell(item)}
                        </td>
                      ))}
                      <td className="actions">
                        <button type="button" className="text-button" onClick={() => ledger.edit(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-button danger"
                          onClick={() => void ledger.remove(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Field({
  field,
  value,
  onChange,
}: {
  field: RecordField
  value: string
  onChange: (value: string) => void
}) {
  const kind = field.kind ?? 'text'
  return (
    <label>
      {field.label}
      {kind === 'textarea' ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={field.rows ?? 3}
          placeholder={field.placeholder}
          required={field.required}
        />
      ) : kind === 'select' ? (
        <select value={value} onChange={(event) => onChange(event.target.value)} required={field.required}>
          <option value="">{field.emptyLabel ?? (field.required ? 'Select…' : 'None')}</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <>
          <input
            type={kind === 'date' ? 'date' : kind === 'number' ? 'number' : 'text'}
            inputMode={kind === 'number' ? 'decimal' : undefined}
            step={kind === 'number' ? field.step ?? 'any' : undefined}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            list={field.list}
          />
          {field.list && field.listValues && (
            <datalist id={field.list}>
              {field.listValues.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          )}
        </>
      )}
    </label>
  )
}