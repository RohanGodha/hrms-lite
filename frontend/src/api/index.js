import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } })

api.interceptors.response.use(
  r => r,
  err => {
    const detail = err.response?.data?.detail
    // Field-level error object — pass as-is so forms can use it
    if (detail && typeof detail === 'object' && detail.field) {
      return Promise.reject({ fieldError: true, field: detail.field, message: detail.message })
    }
    const msg = typeof detail === 'string' ? detail : err.message || 'Unexpected error'
    return Promise.reject(new Error(msg))
  }
)

// ── Point 7: Session expiry interceptor ──────────────────────────────────────
let _onExpiry = null
export const setExpiryHandler = fn => { _onExpiry = fn }

api.interceptors.response.use(
  r => r,
  err => {
    if (err?.response?.status === 401 && _onExpiry) _onExpiry()
    return Promise.reject(err)
  }
)

// Auth
export const registerUser     = d  => api.post('/auth/register', d).then(r => r.data)
export const loginUser        = d  => api.post('/auth/login', d).then(r => r.data)
export const getMe            = () => api.get('/auth/me').then(r => r.data)
export const changePassword   = d  => api.post('/auth/change-password', d).then(r => r.data)
export const updateProfile    = d  => api.patch('/auth/profile', d).then(r => r.data)

// Users
export const getUsers         = ()          => api.get('/users').then(r => r.data)
export const updateUserRole   = (id, role)  => api.patch(`/users/${id}/role?role=${role}`).then(r => r.data)
export const deleteUser       = id          => api.delete(`/users/${id}`)

// Employees
export const getEmployees     = ()       => api.get('/employees').then(r => r.data)
export const createEmployee   = d        => api.post('/employees', d).then(r => r.data)
export const editEmployee     = (id, d)  => api.patch(`/employees/${id}`, d).then(r => r.data)
export const deleteEmployee   = id       => api.delete(`/employees/${id}`)

// Attendance
export const getAttendance    = p  => api.get('/attendance', { params: p }).then(r => r.data)
export const markAttendance   = d  => api.post('/attendance', d).then(r => r.data)

// Dashboard
export const getDashboard     = () => api.get('/dashboard').then(r => r.data)

// Logs
export const getLogs          = () => api.get('/logs').then(r => r.data)

// Health
export const getHealth        = () => api.get('/health').then(r => r.data)

export default api
