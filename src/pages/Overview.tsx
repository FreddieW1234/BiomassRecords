import { useConnection } from '../context/ConnectionContext'
import { originLabel } from '../config'

const steps = [
  {
    title: 'This site',
    body: 'React static build. Host it on Render, or run it locally with Vite. It never holds the database.',
  },
  {
    title: 'Cloudflare Tunnel',
    body: 'A public HTTPS hostname that forwards to the API on your server. Paste that hostname into Connection Lab.',
  },
  {
    title: 'API + SQLite',
    body: 'Run npm run server on the machine behind the tunnel. Records are stored in server/data/biomass.db.',
  },
]

export function Overview() {
  const { settings, health, lastError, lastMs, ping, checking } = useConnection()
  const origin = originLabel()

  return (
    <div className="page">
      <div className="page-head">
        <h1>Wire the ledger to the tunnel</h1>
        <p>
          This is the app shell. Use it to prove that the hosted site can read and write
          a database on your server through Cloudflare.
        </p>
      </div>

      <section className="hero-grid">
        <article className="paper">
          <h2>How traffic moves</h2>
          <ol className="flow">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <article className="paper">
          <h2>This browser</h2>
          <dl className="facts">
            <div>
              <dt>Site origin</dt>
              <dd>{origin}</dd>
            </div>
            <div>
              <dt>API URL</dt>
              <dd>{settings.apiUrl || 'Not set'}</dd>
            </div>
            <div>
              <dt>Last health check</dt>
              <dd>
                {health
                  ? `${health.database} · ${health.recordCount} rows · ${lastMs} ms`
                  : lastError || 'Not run yet'}
              </dd>
            </div>
          </dl>
          <button type="button" className="button" onClick={() => void ping()} disabled={checking}>
            {checking ? 'Checking…' : 'Ping API'}
          </button>
        </article>
      </section>

      <section className="paper">
        <h2>What to do next</h2>
        <ol className="checklist">
          <li>
            On the server: <code>npm run server</code> then{' '}
            <code>cloudflared tunnel --url http://localhost:8787</code>
          </li>
          <li>Open Connection Lab, paste the tunnel URL, and save.</li>
          <li>Run health, write a row, reload the list. If that works, the path is proven.</li>
          <li>Add this repo to GitHub and create a Render Static Site from <code>render.yaml</code>.</li>
        </ol>
      </section>
    </div>
  )
}
