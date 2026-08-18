import { useEffect, useState, type FormEvent } from 'react'
import { createRecord, deleteRecord, listRecords, updateRecord } from '../api/client'
import type { RecordItem } from '../api/types'
import { useConnection } from '../context/ConnectionContext'

export function Records() {
  const { pushLog } = useConnection()
  const [records, setRecords] = useState<RecordItem[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const result = await listRecords()
      setRecords(result.data.records)
      pushLog({
        method: result.method,
        path: result.path,
        status: result.status,
        ms: result.ms,
        ok: true,
        detail: `Loaded ${result.data.records.length} records`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      if (editingId) {
        await updateRecord(editingId, { title, body })
        setEditingId(null)
      } else {
        await createRecord({ title, body })
      }
      setTitle('')
      setBody('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  function edit(record: RecordItem) {
    setEditingId(record.id)
    setTitle(record.title)
    setBody(record.body)
  }

  async function remove(id: number) {
    setError(null)
    try {
      await deleteRecord(id)
      if (editingId === id) {
        setEditingId(null)
        setTitle('')
        setBody('')
      }
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Records</h1>
        <p>Placeholder ledger view. Same SQLite table as Connection Lab; this is the app surface.</p>
      </div>

      <div className="records-grid">
        <form className="paper" onSubmit={onSubmit}>
          <h2>{editingId ? `Edit #${editingId}` : 'New record'}</h2>
          <label>
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <label>
            Notes
            <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={5} />
          </label>
          <div className="row">
            <button type="submit" className="button">
              {editingId ? 'Save changes' : 'Add record'}
            </button>
            {editingId && (
              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  setEditingId(null)
                  setTitle('')
                  setBody('')
                }}
              >
                Cancel
              </button>
            )}
          </div>
          {error && <p className="err">{error}</p>}
        </form>

        <article className="paper">
          <div className="paper-head">
            <h2>Ledger</h2>
            <button type="button" className="text-button" onClick={() => void refresh()}>
              Refresh
            </button>
          </div>
          {loading ? (
            <p className="muted">Loading from the tunnel…</p>
          ) : records.length === 0 ? (
            <p className="muted">No records yet.</p>
          ) : (
            <table className="ledger">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>
                      <strong>{record.title}</strong>
                      {record.body && <p>{record.body}</p>}
                    </td>
                    <td>{record.updated_at.replace('T', ' ').slice(0, 19)}</td>
                    <td className="actions">
                      <button type="button" className="text-button" onClick={() => edit(record)}>
                        Edit
                      </button>
                      <button type="button" className="text-button" onClick={() => void remove(record.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      </div>
    </div>
  )
}
