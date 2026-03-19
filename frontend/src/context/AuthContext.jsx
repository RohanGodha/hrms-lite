import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api, { setExpiryHandler } from '../api'

const AuthCtx = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('hrms-token'))
  const [ready, setReady] = useState(false)

  const logout = (expired = false) => {
    localStorage.removeItem('hrms-token')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    // ── Point 7: Session expiry toast ────────────────────────────────────────
    if (expired) {
      toast.error('Your session has expired. Please sign in again.', { duration: 5000 })
    }
  }

  useEffect(() => {
    // Register the expiry handler so the axios interceptor can call it
    setExpiryHandler(() => logout(true))
  }, [])

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get('/auth/me')
        .then(r => setUser(r.data))
        .catch(() => { logout(true) })
        .finally(() => setReady(true))
    } else {
      setReady(true)
    }
  }, [])

  const login = (tokenStr, userData) => {
    localStorage.setItem('hrms-token', tokenStr)
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenStr}`
    setToken(tokenStr)
    setUser(userData)
  }

  const refreshUser = (updated) => setUser(updated)

  return (
    <AuthCtx.Provider value={{ user, token, login, logout, ready, isAdmin: user?.role === 'admin', refreshUser }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
