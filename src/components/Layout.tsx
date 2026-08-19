import { NavLink, Outlet } from 'react-router-dom'
import { useConnection } from '../context/ConnectionContext'

function statusKind(connected: boolean, error: string | null) {
  if (error) return 'down'
  if (connected) return 'up'
  return 'idle'
}

export function Layout() {
  const { health, lastError, lastMs, checking, ping } = useConnection()
  const kind = statusKind(Boolean(health?.ok), lastError)

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
            <span>Michton · Biomass Wood</span>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <p className="nav-label">Records</p>
          <NavLink to="/cleaning">Cleaning</NavLink>
          <NavLink to="/maintenance">Maintenance</NavLink>
          <NavLink to="/meter-readings">Meter readings</NavLink>
          <NavLink to="/earnings">Earnings</NavLink>
          <p className="nav-label">Setup</p>
          <NavLink to="/boilers">Boilers</NavLink>
        </nav>

        <div className="sidebar-foot">
          <button
            type="button"
            className={`status-pill status-${kind}`}
            onClick={() => void ping()}
            title="Click to re-check the connection"
          >
            <span className="status-dot" />
            <span>
              {checking && 'Checking…'}
              {!checking && kind === 'up' && 'Server connected'}
              {!checking && kind === 'down' && 'Server unreachable'}
              {!checking && kind === 'idle' && 'Not checked yet'}
            </span>
          </button>
          {lastMs !== null && <p className="muted">Last check {lastMs} ms</p>}
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
