import { useMemo, type FormEvent } from 'react'
import { boilersApi } from '../api/client'
import type { Boiler } from '../api/types'
import { useLedger } from '../hooks/useLedger'

const empty = () => ({ number: '', type: '', location: '', notes: '' })

export function Boilers() {
  const ledger = useLedger<Boiler, ReturnType<typeof empty>>({
    api: boilersApi,
    empty,
    toForm: (b) => ({ number: b.number, type: b.type, location: b.location, notes: b.notes }),
  })

  const knownTypes = useMemo(
    () => [...new Set(ledger.items.map((b) => b.type).filter(Boolean))],
    [ledger.items],
  )

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void ledger.submit()
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Boilers</h1>
        <p>
          The register of boilers. Every cleaning, maintenance, and meter entry can point at one of
          these, so set them up first.
        </p>
      </div>

      <div className="split">
        <form className="card form-card" onSubmit={onSubmit}>
          <h2>{ledger.editingId ? `Edit boiler #${ledger.editingId}` : 'Add a boiler'}</h2>
          <label>
            Boiler number
            <input
              value={ledger.form.number}
              onChange={(e) => ledger.setField('number', e.target.value)}
              placeholder="e.g. 1, 2, B3"
              required
            />
          </label>
          <label>
            Type
            <input
              value={ledger.form.type}
              onChange={(e) => ledger.setField('type', e.target.value)}
              placeholder="e.g. Herz 150kW, ETA Hack 200"
              list="boiler-types"
              required
            />
            <datalist id="boiler-types">
              {knownTypes.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </label>
          <label>
            Location
            <input
              value={ledger.form.location}
              onChange={(e) => ledger.setField('location', e.target.value)}
              placeholder="Site or building (optional)"
            />
          </label>
          <label>
            Notes
            <textarea
              value={ledger.form.notes}
              onChange={(e) => ledger.setField('notes', e.target.value)}
              rows={3}
            />
          </label>
          <div className="row">
            <button type="submit" className="button" disabled={ledger.saving}>
              {ledger.editingId ? 'Save changes' : 'Add boiler'}
            </button>
            {ledger.editingId && (
              <button type="button" className="button ghost" onClick={ledger.cancel}>
                Cancel
              </button>
            )}
          </div>
          {ledger.error && <p className="err">{ledger.error}</p>}
        </form>

        <section className="card">
          <div className="card-head">
            <h2>Register</h2>
            <span className="count">{ledger.items.length}</span>
          </div>
          {ledger.loading ? (
            <p className="muted">Loading…</p>
          ) : ledger.items.length === 0 ? (
            <p className="muted">No boilers yet. Add the first one on the left.</p>
          ) : (
            <div className="table-wrap">
              <table className="ledger">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Notes</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {ledger.items.map((boiler) => (
                    <tr key={boiler.id}>
                      <td>
                        <span className="chip">No. {boiler.number}</span>
                      </td>
                      <td>{boiler.type}</td>
                      <td>{boiler.location || '—'}</td>
                      <td className="wrap">{boiler.notes || '—'}</td>
                      <td className="actions">
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => ledger.edit(boiler)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-button danger"
                          onClick={() => void ledger.remove(boiler.id)}
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
