import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Trash2, Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUsers, updateUserRole, deleteUser } from '../api'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import s from './Users.module.css'

export default function Users() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { setUsers(await getUsers()) }
    catch(e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleRole = async (id, role) => {
    try {
      await updateUserRole(id, role)
      setUsers(p => p.map(u => u.id === id ? {...u, role} : u))
      toast.success('Role updated')
    } catch(e) { toast.error(e.message) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return
    try {
      await deleteUser(id)
      setUsers(p => p.filter(u => u.id !== id))
      toast.success('User deleted')
    } catch(e) { toast.error(e.message) }
  }

  return (
    <div className={s.page}>
      <motion.div className={s.header} initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}>
        <div>
          <h1 className={s.title}>User Management</h1>
          <p className={s.sub}>{users.length} registered user{users.length!==1?'s':''}</p>
        </div>
        <div className={s.adminBadge}><Crown size={14}/> Admin Only</div>
      </motion.div>

      {loading && <div className={s.spinWrap}><div className={s.spinner}/></div>}

      {!loading && (
        <motion.div className={s.tableWrap} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
          <table className={s.table}>
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th/></tr></thead>
            <tbody>
              {users.map((u, i) => (
                <motion.tr key={u.id} className={s.row}
                  initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
                  <td>
                    <div className={s.userCell}>
                      <div className={s.avatar} style={{background: u.role==='admin'?'var(--purple-dim)':'var(--accent-dim)', color: u.role==='admin'?'var(--purple)':'var(--accent)'}}>
                        {u.name[0]}
                      </div>
                      <div>
                        <div className={s.userName}>{u.name} {u.id===me?.id&&<span className={s.youTag}>You</span>}</div>
                      </div>
                    </div>
                  </td>
                  <td className={s.emailCell}>{u.email}</td>
                  <td>
                    <select className={`${s.roleSelect} ${u.role==='admin'?s.adminSelect:s.userSelect}`}
                      value={u.role} onChange={e=>handleRole(u.id,e.target.value)}
                      disabled={u.id===me?.id}>
                      <option value="user">👤 Member</option>
                      <option value="admin">🛡️ Admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`${s.statusBadge} ${u.is_active?s.active:s.inactive}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className={s.dateCell}>{u.created_at?format(new Date(u.created_at),'dd MMM yyyy'):'—'}</td>
                  <td>
                    {u.id !== me?.id && (
                      <button className={s.delBtn} onClick={()=>handleDelete(u.id, u.name)}><Trash2 size={14}/></button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  )
}
