import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ScrollText, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { getLogs } from '../api'
import { formatDistanceToNow } from 'date-fns'
import s from './Logs.module.css'

const ACTION_COLORS = {
  LOGIN:'var(--green)', REGISTER:'var(--accent)', CREATE_EMPLOYEE:'var(--accent)',
  DELETE_EMPLOYEE:'var(--red)', MARK_ATTENDANCE:'var(--purple)', UPDATE_ROLE:'var(--amber)',
  DELETE_USER:'var(--red)',
}

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { setLogs(await getLogs()) }
    catch(e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className={s.page}>
      <motion.div className={s.header} initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}>
        <div>
          <h1 className={s.title}>Audit Logs</h1>
          <p className={s.sub}>Complete system activity history</p>
        </div>
        <button className={s.refreshBtn} onClick={load}>
          <RefreshCw size={14} className={loading?s.spinning:''}/> Refresh
        </button>
      </motion.div>

      {loading && <div className={s.spinWrap}><div className={s.spinner}/></div>}

      {!loading && (
        <motion.div className={s.timeline} initial={{opacity:0}} animate={{opacity:1}}>
          {logs.length === 0 && <div className={s.empty}><ScrollText size={28}/><p>No logs yet.</p></div>}
          {logs.map((log, i) => (
            <motion.div key={log.id} className={s.logItem}
              initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.02}}>
              <div className={s.logDot} style={{background: ACTION_COLORS[log.action]||'var(--text-3)'}}/>
              <div className={s.logContent}>
                <div className={s.logTop}>
                  <span className={s.logAction} style={{color: ACTION_COLORS[log.action]||'var(--text-2)'}}>
                    {log.action.replace(/_/g,' ')}
                  </span>
                  {log.resource && <span className={s.logResource}>{log.resource}</span>}
                  <span className={s.logTime}>
                    {log.created_at ? formatDistanceToNow(new Date(log.created_at), {addSuffix:true}) : '—'}
                  </span>
                </div>
                {log.detail && <div className={s.logDetail}>{log.detail}</div>}
                {log.user && <div className={s.logUser}>by {log.user.name} ({log.user.email})</div>}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
