import { useState } from 'react'
import Modal from './Modal'
import f from './form.module.css'
import { format } from 'date-fns'

export default function MarkAttendanceModal({ isOpen, onClose, onSubmit, employees }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [form, setForm] = useState({ employee_id: '', date: today, status: 'Present' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.employee_id) errs.employee_id = 'Please select an employee'
    if (!form.date)        errs.date        = 'Date is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await onSubmit({ ...form, employee_id: Number(form.employee_id) })
      setForm({ employee_id: '', date: today, status: 'Present' })
      setErrors({})
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm({ employee_id: '', date: today, status: 'Present' })
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Mark Attendance">
      <form className={f.form} onSubmit={handleSubmit} noValidate>
        <div className={f.field}>
          <label className={f.label}>Employee *</label>
          <select className={f.select} value={form.employee_id} onChange={set('employee_id')}>
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.employee_id})
              </option>
            ))}
          </select>
          {errors.employee_id && <span className={f.error}>{errors.employee_id}</span>}
        </div>

        <div className={f.row}>
          <div className={f.field}>
            <label className={f.label}>Date *</label>
            <input
              className={f.input}
              type="date"
              value={form.date}
              onChange={set('date')}
              max={today}
            />
            {errors.date && <span className={f.error}>{errors.date}</span>}
          </div>

          <div className={f.field}>
            <label className={f.label}>Status *</label>
            <select className={f.select} value={form.status} onChange={set('status')}>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        <div className={f.actions}>
          <button type="button" className={f.cancelBtn} onClick={handleClose}>Cancel</button>
          <button type="submit" className={f.submitBtn} disabled={loading}>
            {loading ? 'Saving…' : 'Save Attendance'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
