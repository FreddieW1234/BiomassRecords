import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ConnectionProvider } from './context/ConnectionContext'
import { ConnectionLab } from './pages/ConnectionLab'
import { Overview } from './pages/Overview'
import { Records } from './pages/Records'

export default function App() {
  return (
    <ConnectionProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/lab" element={<ConnectionLab />} />
            <Route path="/records" element={<Records />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConnectionProvider>
  )
}
