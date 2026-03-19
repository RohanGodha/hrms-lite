import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import Users from './pages/Users'
import Logs from './pages/Logs'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, ready, isAdmin } = useAuth()
  if (!ready) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--bg)'}}><div style={{width:40,height:40,border:'2px solid var(--border-2)',borderTopColor:'var(--accent)',borderRadius:'50%',animation:'spin .7s linear infinite'}} /></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="employees"  element={<Employees />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="profile"    element={<Profile />} />
        <Route path="users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
        <Route path="logs"  element={<ProtectedRoute adminOnly><Logs /></ProtectedRoute>} />
        <Route path="*"     element={<NotFound />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background:'var(--bg-3)', color:'var(--text)', border:'1px solid var(--border)', fontFamily:'Inter,sans-serif', fontSize:'13px', borderRadius:'12px' },
              success: { iconTheme: { primary:'var(--green)', secondary:'var(--bg)' } },
              error:   { iconTheme: { primary:'var(--red)',   secondary:'var(--bg)' } },
            }}
          />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
