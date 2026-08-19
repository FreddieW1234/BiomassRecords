import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ConnectionProvider } from './context/ConnectionContext'
import { Boilers } from './pages/Boilers'
import { Cleaning } from './pages/Cleaning'
import { Dashboard } from './pages/Dashboard'
import { Earnings } from './pages/Earnings'
import { Maintenance } from './pages/Maintenance'
import { MeterReadings } from './pages/MeterReadings'

export default function App() {
  return (
    <ConnectionProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/boilers" element={<Boilers />} />
            <Route path="/cleaning" element={<Cleaning />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/meter-readings" element={<MeterReadings />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConnectionProvider>
  )
}
