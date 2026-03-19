import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, Search, Trash2, Users, Pencil, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { getEmployees, createEmployee, editEmployee, deleteEmployee } from '../api'
import { useAuth } from '../context/AuthContext'
import { SkeletonTable } from '../components/Skeleton'
import ErrorState from '../components/ErrorState'
import Modal from '../components/Modal'
import f from '../components/form.module.css'
import s from './Employees.module.css'

const DEPTS  = ['Engineering','Product','Design','Marketing','Sales','Human Resources','Finance','Operations','Legal','Other']
const COLORS = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16']
const EMPTY  = { employee_id:'', full_name:'', email:'', department:'', position:'', phone:'', avatar_color: COLORS[0] }
const PAGE_SIZE = 10

// ── Point 5: CSV export helper ──────────────────────────────────────────────
function exportCSV(employees) {
  const headers = ['Employee ID','Full Name','Email','Department','Position','Phone','Joined']
  const rows = employees.map(e => [
    e.employee_id, e.full_name, e.email, e.department,
    e.position || '', e.phone || '',
    e.created_at ? format(new Date(e.created_at), 'dd MMM yyyy') : '',
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `employees-${format(new Date(),'yyyy-MM-dd')}.csv`
  a.click(); URL.revokeObjectURL(url)
}

export default function Employees() {
  const { isAdmin } = useAuth()
  const [employees, setEmployees] = useState([])
  const [filtered,  setFiltered]  = useState([])
  const [search,    setSearch]    = useState('')
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [page,      setPage]      = useState(1)

  // Modals
  const [showAdd,   setShowAdd]   = useState(false)
  const [editTarget,setEditTarget]= useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting,  setDeleting]  = useState(false)

  // Forms
  const [form,   setForm]   = useState(EMPTY)
  const [errs,   setErrs]   = useState({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { const d = await getEmployees(); setEmployees(d); setFiltered(d) }
    catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(employees.filter(e =>
      e.full_name.toLowerCase().includes(q) ||
      e.employee_id.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    ))
    setPage(1)
  }, [search, employees])

  // ── Point 2: Pagination ──────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.employee_id.trim()) e.employee_id = 'Required'
    if (!form.full_name.trim())   e.full_name   = 'Required'
    if (!form.email.trim())       e.email       = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.department)         e.department  = 'Required'
    return e
  }

  // ── Add Employee ─────────────────────────────────────────────────────────
  const handleAdd = async ev => {
    ev.preventDefault()
    const e = validate(); if (Object.keys(e).length) { setErrs(e); return }
    setSaving(true)
    try {
      const emp = await createEmployee(form)
      setEmployees(p => [emp, ...p])
      toast.success(`${emp.full_name} added!`)
      setShowAdd(false); setForm(EMPTY); setErrs({})
    } catch(err) {
      // ── Point 3: Field-level errors ────────────────────────────────────
      if (err?.fieldError) setErrs({ [err.field]: err.message })
      else toast.error(err.message)
    } finally { setSaving(false) }
  }

  // ── Point 1: Edit Employee ────────────────────────────────────────────────
  const openEdit = emp => {
    setForm({ employee_id: emp.employee_id, full_name: emp.full_name, email: emp.email,
              department: emp.department, position: emp.position || '', phone: emp.phone || '',
              avatar_color: emp.avatar_color || COLORS[0] })
    setErrs({})
    setEditTarget(emp)
  }

  const handleEdit = async ev => {
    ev.preventDefault()
    const e = validate(); if (Object.keys(e).length) { setErrs(e); return }
    setSaving(true)
    try {
      const updated = await editEmployee(editTarget.id, form)
      setEmployees(p => p.map(e => e.id === updated.id ? updated : e))
      toast.success(`${updated.full_name} updated!`)
      setEditTarget(null); setForm(EMPTY); setErrs({})
    } catch(err) {
      if (err?.fieldError) setErrs({ [err.field]: err.message })
      else toast.error(err.message)
    } finally { setSaving(false) }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!delTarget) return
    setDeleting(true)
    try {
      await deleteEmployee(delTarget.id)
      setEmployees(p => p.filter(e => e.id !== delTarget.id))
      toast.success(`${delTarget.full_name} removed`)
      setDelTarget(null)
    } catch(err) { toast.error(err.message) }
    finally { setDeleting(false) }
  }

  const EmployeeForm = ({ onSubmit, submitLabel }) => (
    <form className={f.form} onSubmit={onSubmit} noValidate>
      <div className={f.row}>
        <div className={f.field}>
          <label className={f.label}>Employee ID *</label>
          <input className={`${f.input} ${errs.employee_id ? f.inputErr : ''}`}
            placeholder="EMP001" value={form.employee_id} onChange={set('employee_id')} />
          {errs.employee_id && <span className={f.err}>{errs.employee_id}</span>}
        </div>
        <div className={f.field}>
          <label className={f.label}>Department *</label>
          <select className={`${f.select} ${errs.department ? f.inputErr : ''}`}
            value={form.department} onChange={set('department')}>
            <option value="">Select…</option>
            {DEPTS.map(d => <option key={d}>{d}</option>)}
          </select>
          {errs.department && <span className={f.err}>{errs.department}</span>}
        </div>
      </div>
      <div className={f.field}>
        <label className={f.label}>Full Name *</label>
        <input className={`${f.input} ${errs.full_name ? f.inputErr : ''}`}
          placeholder="Jane Smith" value={form.full_name} onChange={set('full_name')} />
        {errs.full_name && <span className={f.err}>{errs.full_name}</span>}
      </div>
      <div className={f.field}>
        <label className={f.label}>Email *</label>
        <input className={`${f.input} ${errs.email ? f.inputErr : ''}`}
          type="email" placeholder="jane@company.com"
          value={form.email} onChange={set('email')} />
        {errs.email && <span className={f.err}>{errs.email}</span>}
      </div>
      <div className={f.row}>
        <div className={f.field}>
          <label className={f.label}>Position</label>
          <input className={f.input} placeholder="e.g. Senior Engineer"
            value={form.position} onChange={set('position')} />
        </div>
        <div className={f.field}>
          <label className={f.label}>Phone</label>
          <input className={f.input} placeholder="+91 9999999999"
            value={form.phone} onChange={set('phone')} />
        </div>
      </div>
      <div className={f.field}>
        <label className={f.label}>Avatar Color</label>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:2 }}>
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setForm(p => ({ ...p, avatar_color: c }))}
              style={{ width:26, height:26, borderRadius:'50%', background:c, cursor:'pointer',
                border: form.avatar_color === c ? '3px solid var(--text)' : '2px solid transparent',
                transform: form.avatar_color === c ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform .15s, border .15s' }} />
          ))}
        </div>
      </div>
      <div className={f.actions}>
        <button type="button" className={f.cancelBtn}
          onClick={() => { setShowAdd(false); setEditTarget(null); setForm(EMPTY); setErrs({}) }}>
          Cancel
        </button>
        <button type="submit" className={f.submitBtn} disabled={saving}>
          {saving ? <span className={f.spin} /> : submitLabel}
        </button>
      </div>
    </form>
  )

  return (
    <div className={s.page}>
      <motion.div className={s.header} initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <div>
          <h1 className={s.title}>Employees</h1>
          <p className={s.sub}>{employees.length} total employee{employees.length !== 1 ? 's' : ''}</p>
        </div>
        <div className={s.headerActions}>
          {/* Point 5: CSV Export */}
          {employees.length > 0 && (
            <button className={s.exportBtn} onClick={() => exportCSV(filtered.length ? filtered : employees)} title="Export to CSV">
              <Download size={15} /> Export CSV
            </button>
          )}
          <button className={s.addBtn} onClick={() => { setForm(EMPTY); setErrs({}); setShowAdd(true) }}>
            <Plus size={16} /> Add Employee
          </button>
        </div>
      </motion.div>

      {/* Search */}
      {!loading && !error && employees.length > 0 && (
        <div className={s.searchWrap}>
          <Search size={14} className={s.searchIcon} />
          <input className={s.search}
            placeholder="Search by name, ID, email, department…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <span className={s.searchCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      )}

      {/* Point 8: Skeleton instead of spinner */}
      {loading && <SkeletonTable rows={8} cols={7} />}
      {error && !loading && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        employees.length === 0
          ? <div className={s.empty}><Users size={40} className={s.emptyIcon} /><p>No employees yet. Add your first one!</p></div>
          : filtered.length === 0
            ? <div className={s.empty}><Search size={32} className={s.emptyIcon} /><p>No results for "{search}"</p></div>
            : (
              <>
                <div className={s.tableWrap}>
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th>Employee</th><th>ID</th><th>Department</th>
                        <th>Position</th><th>Email</th><th>Joined</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((emp, i) => (
                        <motion.tr key={emp.id} className={s.row}
                          initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                          transition={{ delay: i * 0.03 }}>
                          <td>
                            <div className={s.empCell}>
                              <div className={s.avatar} style={{ background: emp.avatar_color || '#3b82f6' }}>
                                {emp.full_name[0]}
                              </div>
                              <span className={s.empName}>{emp.full_name}</span>
                            </div>
                          </td>
                          <td><span className={s.empId}>{emp.employee_id}</span></td>
                          <td><span className={s.tag}>{emp.department}</span></td>
                          <td className={s.pos}>{emp.position || '—'}</td>
                          <td className={s.email}>{emp.email}</td>
                          <td className={s.date}>
                            {emp.created_at ? format(new Date(emp.created_at), 'dd MMM yyyy') : '—'}
                          </td>
                          <td className={s.actionCol}>
                            <button className={s.editBtn} onClick={() => openEdit(emp)} title="Edit">
                              <Pencil size={13} />
                            </button>
                            {isAdmin && (
                              <button className={s.delBtn} onClick={() => setDelTarget(emp)} title="Delete">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Point 2: Pagination */}
                {totalPages > 1 && (
                  <div className={s.pagination}>
                    <span className={s.pageInfo}>
                      Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
                    </span>
                    <div className={s.pageControls}>
                      <button className={s.pageBtn} disabled={page === 1} onClick={() => setPage(p => p-1)}>
                        <ChevronLeft size={15} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i+1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && arr[idx-1] !== p-1) acc.push('…')
                          acc.push(p); return acc
                        }, [])
                        .map((p, i) => (
                          typeof p === 'string'
                            ? <span key={`e${i}`} className={s.pageDots}>{p}</span>
                            : <button key={p} className={`${s.pageBtn} ${p === page ? s.pageBtnActive : ''}`}
                                onClick={() => setPage(p)}>{p}</button>
                        ))
                      }
                      <button className={s.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p+1)}>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setForm(EMPTY); setErrs({}) }} title="Add New Employee">
        <EmployeeForm onSubmit={handleAdd} submitLabel="Add Employee" />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTarget} onClose={() => { setEditTarget(null); setForm(EMPTY); setErrs({}) }} title="Edit Employee">
        <EmployeeForm onSubmit={handleEdit} submitLabel="Save Changes" />
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!delTarget} onClose={() => setDelTarget(null)} title="Delete Employee" width={420}>
        <div style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
          <div style={{ width:52,height:52,borderRadius:14,background:'var(--red-dim)',border:'1px solid rgba(239,68,68,.2)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--red)' }}>
            <Trash2 size={22} />
          </div>
          <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.6 }}>
            Delete <strong style={{ color:'var(--text)' }}>{delTarget?.full_name}</strong>?
            This also removes all their attendance records.
          </p>
          <div style={{ display:'flex', gap:10, width:'100%' }}>
            <button style={{ flex:1,padding:'9px',borderRadius:'var(--radius)',background:'transparent',border:'1px solid var(--border)',color:'var(--text-2)',cursor:'pointer' }}
              onClick={() => setDelTarget(null)} disabled={deleting}>Cancel</button>
            <button style={{ flex:1,padding:'9px',borderRadius:'var(--radius)',background:'var(--red)',color:'#fff',fontWeight:600,cursor:'pointer',opacity:deleting?.5:1,border:'none' }}
              onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
