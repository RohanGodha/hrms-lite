import { useState, useEffect, useCallback } from 'react'
import { Plus, Users, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { getEmployees, createEmployee, deleteEmployee } from '../api'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import PageHeader from '../components/PageHeader'
import AddEmployeeModal from '../components/AddEmployeeModal'
import ConfirmModal from '../components/ConfirmModal'
import styles from './Employees.module.css'
import { format } from 'date-fns'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getEmployees()
      setEmployees(data)
      setFiltered(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      employees.filter(
        (e) =>
          e.full_name.toLowerCase().includes(q) ||
          e.employee_id.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      )
    )
  }, [search, employees])

  const handleAdd = async (form) => {
    try {
      const emp = await createEmployee(form)
      setEmployees((prev) => [emp, ...prev])
      toast.success(`${emp.full_name} added successfully`)
    } catch (e) {
      toast.error(e.message)
      throw e
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteEmployee(deleteTarget.id)
      setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id))
      toast.success(`${deleteTarget.full_name} removed`)
      setDeleteTarget(null)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} total employee${employees.length !== 1 ? 's' : ''}`}
        action={
          <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
            <Plus size={16} />
            Add Employee
          </button>
        }
      />

      {loading && <Spinner />}
      {error && !loading && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <>
          {employees.length > 0 && (
            <div className={styles.searchBar}>
              <Search size={15} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Search by name, ID, email or department…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          {employees.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No employees yet"
              description="Add your first employee to get started with the system."
              action={
                <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
                  <Plus size={15} /> Add Employee
                </button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No results found"
              description={`No employees match "${search}". Try a different search term.`}
            />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Joined</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp) => (
                    <tr key={emp.id} className={styles.row}>
                      <td>
                        <span className={styles.empId}>{emp.employee_id}</span>
                      </td>
                      <td className={styles.name}>{emp.full_name}</td>
                      <td className={styles.email}>{emp.email}</td>
                      <td>
                        <span className={styles.dept}>{emp.department}</span>
                      </td>
                      <td className={styles.date}>
                        {emp.created_at
                          ? format(new Date(emp.created_at), 'dd MMM yyyy')
                          : '—'}
                      </td>
                      <td className={styles.actionCol}>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => setDeleteTarget(emp)}
                          title="Delete employee"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <AddEmployeeModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAdd}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Employee"
        message={`Are you sure you want to delete "${deleteTarget?.full_name}"? This will also remove all their attendance records.`}
      />
    </div>
  )
}
