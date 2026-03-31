import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RulesPage from './pages/settings/RulesPage'
import AppLayout from './components/layout/AppLayout'
import DashboardPlaceholder from './pages/DashboardPlaceholder'

export default function App() {
  return (
    <Routes>
      {/* Public routes — no sidebar */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes — wrapped in AppLayout with sidebar */}
      <Route
        path="/*"
        element={
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPlaceholder />} />
              <Route path="/settings/rules" element={<RulesPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        }
      />
    </Routes>
  )
}
