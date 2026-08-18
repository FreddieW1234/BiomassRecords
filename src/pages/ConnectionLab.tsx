import { useMemo, useState, type FormEvent } from 'react'
import { ApiError, createRecord, deleteRecord, listRecords } from '../api/client'
import type { RecordItem } from '../api/types'
import { originLabel } from '../config'
import { useConnection } from '../context/ConnectionContext'

export function ConnectionLab() {
  const { settings, setSettings, ping, checking, health, lastError, log, pushLog, clearLog } =
    useConnection()
  const [apiUrl, setApiUrl] = useState(settings.apiUrl)
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [title, setTitle] = useState('Written from the site')
  const [body, setBody] = useState('If this row appears after save, tunnel writes are working.')
  const [records, setRecords] = useState<RecordItem[]>([])
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const origin = originLabel()
  const saved = useMemo(
    () => apiUrl.trim() === settings.apiUrl && apiKey === settings.apiKey,
    [apiUrl, apiKey, settings],
  )

  function saveEndpoint(event: FormEvent) {
    event.preventDefault()
    setSettings({ apiUrl, apiKey })
    setNotice('Endpoint saved in this browser. It is not baked into the Render build.')
  }

  async function run<T>(label: string, work: () => Promise<{ data: T; status: number; ms: number; path: string; method: string }>) {
    setBusy(true)
    setNotice(null)
    try {
      const result = await work()
      pushLog({
        method: result.method,
        path: result.path,
        status: result.status,
        ms: result.ms,
        ok: true,
        detail: label,
      })
      return result.data
    } catch (error) {
      const message = error instanceof Error ? error.message : label
      pushLog({
        method: 'REQUEST',
        path: error instanceof ApiError ? error.path : '',
        status: error instanceof ApiError ? error.status || null : null,
        ms: null,
        ok: false,
        detail: message,
      })
      setNotice(message)
      return null
    } finally {
      setBusy(false)
    }
  }

  async function refresh() {
    const data = await run('Listed records', () => listRecords())
    if (data) setRecords(data.records)
  }

  async function writeRow(event: FormEvent) {
    event.preventDefault()
    const data = await run('Created record', () => createRecord({ title, body }))
    if (data) {
      setNotice(`Wrote record #${data.record.id}`)
      await refresh()
    }
  }

  async function removeRow(id: number) {
    const data = await run(`Deleted #${id}`, () => deleteRecord(id))
    if (data) await refresh()
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Connection Lab</h1>
        <p>
          Point this browser at the Cloudflare hostname and prove SQLite reads and writes
          from the static site.
        </p>
      </div>

      <div className="lab-grid">
        <div className="lab-col">
          <form className="paper" onSubmit={saveEndpoint}>
            <h2>Tunnel endpoint</h2>
            <label>
              API base URL
              <input
                value={apiUrl}
                onChange={(event) => setApiUrl(event.target.value)}
                placeholder="https://your-tunnel.trycloudflare.com"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <label>
              API key
              <input
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Same value as API_KEY on the server"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <p className="hint">
              This page is {origin}. The API must allow that origin in CORS. Health checks
              skip the API key; writes require it if the server has one set.
            </p>
            <div className="row">
              <button type="submit" className="button" disabled={saved}>
                {saved ? 'Saved' : 'Save endpoint'}
              </button>
              <button type="button" className="button ghost" onClick={() => void ping()} disabled={checking}>
                {checking ? 'Pinging…' : 'Health check'}
              </button>
            </div>
            {health && (
              <p className="ok">
                {health.service} · {health.database} · {health.recordCount} rows · {health.time}
              </p>
            )}
            {lastError && <p className="err">{lastError}</p>}
          </form>

          <form className="paper" onSubmit={writeRow}>
            <h2>Write a row</h2>
            <label>
              Title
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label>
              Body
              <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} />
            </label>
            <div className="row">
              <button type="submit" className="button" disabled={busy}>
                Insert into SQLite
              </button>
              <button type="button" className="button ghost" onClick={() => void refresh()} disabled={busy}>
                Reload rows
              </button>
            </div>
            {notice && <p className="hint">{notice}</p>}
          </form>
        </div>

        <div className="lab-col">
          <article className="paper">
            <div className="paper-head">
              <h2>Rows in the server database</h2>
              <span className="count">{records.length}</span>
            </div>
            {records.length === 0 ? (
              <p className="muted">No rows loaded yet. Run a health check, then reload rows.</p>
            ) : (
              <ul className="record-list">
                {records.map((record) => (
                  <li key={record.id}>
                    <div>
                      <strong>
                        #{record.id} {record.title}
                      </strong>
                      <p>{record.body || '—'}</p>
                      <time>{record.created_at}</time>
                    </div>
                    <button type="button" className="text-button" onClick={() => void removeRow(record.id)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="paper">
            <div className="paper-head">
              <h2>Request log</h2>
              <button type="button" className="text-button" onClick={clearLog}>
                Clear
              </button>
            </div>
            {log.length === 0 ? (
              <p className="muted">Requests from this tab will appear here.</p>
            ) : (
              <ul className="log-list">
                {log.map((entry) => (
                  <li key={entry.id} className={entry.ok ? 'ok' : 'err'}>
                    <code>
                      {entry.method} {entry.path}
                    </code>
                    <span>
                      {entry.status ?? '—'} · {entry.ms !== null ? `${entry.ms} ms` : 'failed'}
                    </span>
                    <p>{entry.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </div>
    </div>
  )
}
