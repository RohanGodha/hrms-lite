import { useState } from 'react'
import Modal from './Modal'
import f from './form.module.css'

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing',
  'Sales', 'Human Resources', 'Finance', 'Operations', 'Legal', 'Other',
]

const empty = { employee_id: '', full_name: '', email: '', department: '' }

export default function AddEmployeeModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.employee_id.trim()) errs.employee_id = 'Employee ID is required'
    if (!form.full_name.trim())   errs.full_name   = 'Full name is required'
    if (!form.email.trim())       errs.email       = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
    if (!form.department)         errs.department  = 'Department is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await onSubmit(form)
      setForm(empty)
      setErrors({})
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm(empty)
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Employee">
      <form className={f.form} onSubmit={handleSubmit} noValidate>
        <div className={f.row}>
          <div className={f.field}>
            <label className={f.label}>Employee ID *</label>
            <input
              className={f.input}
              placeholder="e.g. EMP001"
              value={form.employee_id}
              onChange={set('employee_id')}
            />
            {errors.employee_id && <span className={f.error}>{errors.employee_id}</span>}
          </div>
          <div className={f.field}>
            <label className={f.label}>Department *</label>
            <select className={f.select} value={form.department} onChange={set('department')}>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.department && <span className={f.error}>{errors.department}</span>}
          </div>
        </div>

        <div className={f.field}>
          <label className={f.label}>Full Name *</label>
          <input
            className={f.input}
            placeholder="e.g. Jane Smith"
            value={form.full_name}
            onChange={set('full_name')}
          />
          {errors.full_name && <span className={f.error}>{errors.full_name}</span>}
        </div>

        <div className={f.field}>
          <label className={f.label}>Email Address *</label>
          <input
            className={f.input}
            type="email"
            placeholder="jane@company.com"
            value={form.email}
            onChange={set('email')}
          />
          {errors.email && <span className={f.error}>{errors.email}</span>}
        </div>

        <div className={f.actions}>
          <button type="button" className={f.cancelBtn} onClick={handleClose}>Cancel</button>
          <button type="submit" className={f.submitBtn} disabled={loading}>
            {loading ? 'Adding…' : 'Add Employee'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
