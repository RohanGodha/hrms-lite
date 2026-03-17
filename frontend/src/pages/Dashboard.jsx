import { useState, useEffect, useCallback } from 'react'
import { Users, UserCheck, UserX, CalendarDays } from 'lucide-react'
import { getDashboard } from '../api'
import StatCard from '../components/StatCard'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import PageHeader from '../components/PageHeader'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getDashboard()
      setData(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className={styles.page}>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your workforce at a glance"
      />

      {loading && <Spinner />}
      {error   && <ErrorState message={error} onRetry={load} />}

      {data && !loading && (
        <>
          <div className={styles.stats}>
            <StatCard
              label="Total Employees"
              value={data.total_employees}
              icon={Users}
              color="accent"
            />
            <StatCard
              label="Present Today"
              value={data.present_today}
              icon={UserCheck}
              color="green"
            />
            <StatCard
              label="Absent Today"
              value={data.absent_today}
              icon={UserX}
              color="red"
            />
            <StatCard
              label="Attendance Records"
              value={data.total_attendance_records}
              icon={CalendarDays}
              color="amber"
            />
          </div>

          <div className={styles.tableSection}>
            <h2 className={styles.sectionTitle}>Employee Attendance Summary</h2>
            <p className={styles.sectionSub}>Total present days per employee across all time</p>

            {data.employee_present_days.length === 0 ? (
              <div className={styles.emptyTable}>No employees found. Add employees to see summary.</div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Full Name</th>
                      <th>Department</th>
                      <th className={styles.right}>Present Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.employee_present_days.map((emp) => (
                      <tr key={emp.id} className={styles.row}>
                        <td>
                          <span className={styles.empId}>{emp.employee_id}</span>
                        </td>
                        <td className={styles.name}>{emp.full_name}</td>
                        <td>
                          <span className={styles.dept}>{emp.department}</span>
                        </td>
                        <td className={styles.right}>
                          <span className={styles.days}>{emp.present_days}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
