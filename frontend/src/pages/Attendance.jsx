import { useState, useEffect, useCallback } from 'react'
import { Plus, CalendarCheck, Filter, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAttendance, getEmployees, markAttendance } from '../api'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import MarkAttendanceModal from '../components/MarkAttendanceModal'
import styles from './Attendance.module.css'
import { format } from 'date-fns'

export default function Attendance() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showMark, setShowMark] = useState(false)

  // Filters
  const [filterEmp, setFilterEmp] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (filterEmp)  params.employee_id = filterEmp
      if (filterFrom) params.date_from   = filterFrom
      if (filterTo)   params.date_to     = filterTo

      const [recs, emps] = await Promise.all([
        getAttendance(params),
        getEmployees(),
      ])
      setRecords(recs)
      setEmployees(emps)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [filterEmp, filterFrom, filterTo])

  useEffect(() => { load() }, [load])

  const handleMark = async (form) => {
    try {
      await markAttendance(form)
      toast.success('Attendance saved')
      load()
    } catch (e) {
      toast.error(e.message)
      throw e
    }
  }

  const clearFilters = () => {
    setFilterEmp('')
    setFilterFrom('')
    setFilterTo('')
  }

  const hasFilters = filterEmp || filterFrom || filterTo

  const empMap = Object.fromEntries(employees.map((e) => [e.id, e]))

  return (
    <div className={styles.page}>
      <PageHeader
        title="Attendance"
        subtitle="Track and manage daily employee attendance"
        action={
          <button className={styles.markBtn} onClick={() => setShowMark(true)}>
            <Plus size={16} />
            Mark Attendance
          </button>
        }
      />

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <Filter size={13} className={styles.filterIcon} />
          <select
            className={styles.select}
            value={filterEmp}
            onChange={(e) => setFilterEmp(e.target.value)}
          >
            <option value="">All employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <input
            type="date"
            className={styles.dateInput}
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            placeholder="From"
          />
          <span className={styles.dateSep}>to</span>
          <input
            type="date"
            className={styles.dateInput}
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            placeholder="To"
          />
        </div>

        {hasFilters && (
          <button className={styles.clearBtn} onClick={clearFilters}>
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {loading && <Spinner />}
      {error && !loading && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        records.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance records"
            description={
              hasFilters
                ? 'No records match the selected filters.'
                : 'Start by marking attendance for your employees.'
            }
            action={
              !hasFilters && (
                <button className={styles.markBtn} onClick={() => setShowMark(true)}>
                  <Plus size={15} /> Mark Attendance
                </button>
              )
            }
          />
        ) : (
          <div className={styles.tableWrap}>
            <div className={styles.tableHeader}>
              <span className={styles.count}>{records.length} record{records.length !== 1 ? 's' : ''}</span>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => {
                  const emp = empMap[rec.employee_id]
                  return (
                    <tr key={rec.id} className={styles.row}>
                      <td className={styles.name}>{emp?.full_name ?? `Employee #${rec.employee_id}`}</td>
                      <td>
                        {emp && (
                          <span className={styles.empId}>{emp.employee_id}</span>
                        )}
                      </td>
                      <td>
                        {emp && <span className={styles.dept}>{emp.department}</span>}
                      </td>
                      <td className={styles.date}>
                        {format(new Date(rec.date + 'T00:00:00'), 'dd MMM yyyy')}
                      </td>
                      <td>
                        <Badge status={rec.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      <MarkAttendanceModal
        isOpen={showMark}
        onClose={() => setShowMark(false)}
        onSubmit={handleMark}
        employees={employees}
      />
    </div>
  )
}
