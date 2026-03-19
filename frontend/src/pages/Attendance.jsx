import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CalendarCheck, Filter, X, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAttendance, getEmployees, markAttendance } from '../api'
import { format } from 'date-fns'
import s from './Attendance.module.css'

function Badge({ status }) {
  const ok = status === 'Present'
  return (
    <span className={`${s.badge} ${ok ? s.present : s.absent}`}>
      {ok ? <CheckCircle size={12}/> : <XCircle size={12}/>}
      {status}
    </span>
  )
}

function MarkModal({ open, onClose, onSubmit, employees }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [form, setForm] = useState({ employee_id:'', date:today, status:'Present', check_in:'', check_out:'', notes:'' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}))

  const submit = async e => {
    e.preventDefault()
    if (!form.employee_id) { setErrors({employee_id:'Required'}); return }
    setLoading(true)
    try {
      await onSubmit({...form, employee_id:Number(form.employee_id)})
      setForm({employee_id:'',date:today,status:'Present',check_in:'',check_out:'',notes:''})
      setErrors({}); onClose()
    } catch {} finally { setLoading(false) }
  }

  if (!open) return null
  return (
    <div className={s.overlay} onClick={onClose}>
      <motion.div className={s.modal} onClick={e=>e.stopPropagation()}
        initial={{opacity:0,scale:.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.95}}>
        <div className={s.modalHeader}><h2>Mark Attendance</h2><button className={s.closeBtn} onClick={onClose}>×</button></div>
        <form className={s.form} onSubmit={submit} noValidate>
          <div className={s.field}>
            <label>Employee *</label>
            <select value={form.employee_id} onChange={set('employee_id')}>
              <option value="">Select employee…</option>
              {employees.map(e=><option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>)}
            </select>
            {errors.employee_id && <span>{errors.employee_id}</span>}
          </div>
          <div className={s.row}>
            <div className={s.field}><label>Date *</label><input type="date" value={form.date} max={today} onChange={set('date')}/></div>
            <div className={s.field}>
              <label>Status *</label>
              <div className={s.statusRow}>
                {['Present','Absent'].map(st=>(
                  <button key={st} type="button"
                    className={`${s.statusBtn} ${form.status===st?s.statusActive:''} ${st==='Present'?s.presentBtn:s.absentBtn}`}
                    onClick={()=>setForm(p=>({...p,status:st}))}>
                    {st==='Present'?<CheckCircle size={14}/>:<XCircle size={14}/>} {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className={s.row}>
            <div className={s.field}><label>Check-in</label><input type="time" value={form.check_in} onChange={set('check_in')}/></div>
            <div className={s.field}><label>Check-out</label><input type="time" value={form.check_out} onChange={set('check_out')}/></div>
          </div>
          <div className={s.field}>
            <label>Notes</label>
            <textarea className={s.textarea} rows={2} placeholder="Optional notes…" value={form.notes} onChange={set('notes')}/>
          </div>
          <div className={s.modalActions}>
            <button type="button" className={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={s.submitBtn} disabled={loading}>
              {loading?<span className={s.spin}/>:'Save Attendance'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Attendance() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMark, setShowMark] = useState(false)
  const [filterEmp, setFilterEmp] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterEmp)  params.employee_id = filterEmp
      if (filterFrom) params.date_from   = filterFrom
      if (filterTo)   params.date_to     = filterTo
      const [recs, emps] = await Promise.all([getAttendance(params), getEmployees()])
      setRecords(recs); setEmployees(emps)
    } catch(e) { toast.error(e.message) }
    finally { setLoading(false) }
  }, [filterEmp, filterFrom, filterTo])

  useEffect(() => { load() }, [load])

  const handleMark = async form => {
    try { await markAttendance(form); toast.success('Attendance saved!'); load() }
    catch(e) { toast.error(e.message); throw e }
  }

  const empMap = Object.fromEntries(employees.map(e=>[e.id,e]))
  const hasFilters = filterEmp || filterFrom || filterTo
  const presentCount = records.filter(r=>r.status==='Present').length
  const absentCount  = records.filter(r=>r.status==='Absent').length

  return (
    <div className={s.page}>
      <motion.div className={s.header} initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}>
        <div>
          <h1 className={s.title}>Attendance</h1>
          <p className={s.sub}>Track daily employee presence</p>
        </div>
        <button className={s.markBtn} onClick={()=>setShowMark(true)}><Plus size={15}/> Mark Attendance</button>
      </motion.div>

      {/* Summary pills */}
      <div className={s.summary}>
        <div className={s.pill}><span className={s.pillDot} style={{background:'var(--green)'}}/>Present: <strong>{presentCount}</strong></div>
        <div className={s.pill}><span className={s.pillDot} style={{background:'var(--red)'}}/>Absent: <strong>{absentCount}</strong></div>
        <div className={s.pill}>Total: <strong>{records.length}</strong></div>
      </div>

      {/* Filters */}
      <div className={s.filters}>
        <Filter size={13} style={{color:'var(--text-3)'}}/>
        <select className={s.filterSelect} value={filterEmp} onChange={e=>setFilterEmp(e.target.value)}>
          <option value="">All employees</option>
          {employees.map(e=><option key={e.id} value={e.id}>{e.full_name}</option>)}
        </select>
        <input type="date" className={s.dateInput} value={filterFrom} onChange={e=>setFilterFrom(e.target.value)}/>
        <span style={{color:'var(--text-3)',fontSize:12}}>to</span>
        <input type="date" className={s.dateInput} value={filterTo} onChange={e=>setFilterTo(e.target.value)}/>
        {hasFilters && <button className={s.clearBtn} onClick={()=>{setFilterEmp('');setFilterFrom('');setFilterTo('')}}><X size={13}/> Clear</button>}
      </div>

      {loading && <div className={s.spinWrap}><div className={s.spinner}/></div>}

      {!loading && records.length === 0 && (
        <div className={s.empty}>
          <CalendarCheck size={32} style={{color:'var(--text-3)',marginBottom:12}}/>
          <p>{hasFilters ? 'No records match filters.' : 'No attendance records yet.'}</p>
        </div>
      )}

      {!loading && records.length > 0 && (
        <motion.div className={s.tableWrap} initial={{opacity:0}} animate={{opacity:1}}>
          <table className={s.table}>
            <thead><tr><th>Employee</th><th>ID</th><th>Department</th><th>Date</th><th>Status</th><th>Check-in</th><th>Check-out</th></tr></thead>
            <tbody>
              {records.map((rec,i)=>{
                const emp = empMap[rec.employee_id]
                return (
                  <motion.tr key={rec.id} className={s.row}
                    initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.025}}>
                    <td>
                      <div className={s.empCell}>
                        {emp && <div className={s.empAvatar} style={{background:(emp.avatar_color||'#3b82f6')+'22',color:emp.avatar_color||'#3b82f6'}}>{emp.full_name[0]}</div>}
                        <span className={s.empName}>{emp?.full_name ?? `#${rec.employee_id}`}</span>
                      </div>
                    </td>
                    <td>{emp&&<span className={s.empId}>{emp.employee_id}</span>}</td>
                    <td>{emp&&<span className={s.dept}>{emp.department}</span>}</td>
                    <td className={s.dateCell}>{format(new Date(rec.date+'T00:00:00'),'dd MMM yyyy')}</td>
                    <td><Badge status={rec.status}/></td>
                    <td className={s.timeCell}>{rec.check_in||'—'}</td>
                    <td className={s.timeCell}>{rec.check_out||'—'}</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      <AnimatePresence>
        {showMark && <MarkModal open={showMark} onClose={()=>setShowMark(false)} onSubmit={handleMark} employees={employees}/>}
      </AnimatePresence>
    </div>
  )
}
