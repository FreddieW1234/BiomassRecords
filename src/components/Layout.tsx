import { NavLink, Outlet } from 'react-router-dom'
import { useConnection } from '../context/ConnectionContext'

function statusKind(connected: boolean, hasUrl: boolean, error: string | null) {
  if (!hasUrl) return 'idle'
  if (error) return 'down'
  if (connected) return 'up'
  return 'idle'
}

export function Layout() {
  const { health, lastError, lastMs, settings } = useConnection()
  const kind = statusKind(Boolean(health?.ok), Boolean(settings.apiUrl), lastError)

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="currentColor" />
            <circle cx="16" cy="16" r="10.5" fill="none" stroke="#c9a227" strokeWidth="1.4" />
            <circle cx="16" cy="16" r="6.5" fill="none" stroke="#d7e4d6" strokeWidth="1.4" />
            <circle cx="16" cy="16" r="2.2" fill="#efe6d4" />
          </svg>
          <div>
            <strong>BiomassRecords</strong>
            <span>Field ledger</span>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end>
            Overview
          </NavLink>
          <NavLink to="/lab">Connection Lab</NavLink>
          <NavLink to="/records">Records</NavLink>
        </nav>

        <div className="sidebar-foot">
          <div className={`status-pill status-${kind}`}>
            <span className="status-dot" />
            <span>
              {kind === 'up' && 'API reachable'}
              {kind === 'down' && 'API unreachable'}
              {kind === 'idle' && 'API not tested'}
            </span>
          </div>
          {lastMs !== null && <p className="muted">Last ping {lastMs} ms</p>}
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <p className="eyebrow">Static app · live data over Cloudflare Tunnel</p>
          <p className="host">{settings.apiUrl || 'No tunnel URL configured'}</p>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
