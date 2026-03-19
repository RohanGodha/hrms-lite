import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, AlertCircle } from 'lucide-react'
import s from './NotFound.module.css'

export default function NotFound() {
  return (
    <div className={s.page}>
      <motion.div className={s.card}
        initial={{ opacity:0, y:30, scale:0.96 }}
        animate={{ opacity:1, y:0,  scale:1 }}
        transition={{ duration:0.5, ease:[.16,1,.3,1] }}>

        <div className={s.iconWrap}>
          <AlertCircle size={36} />
        </div>

        <div className={s.code}>404</div>
        <h1 className={s.title}>Page not found</h1>
        <p className={s.sub}>
          The page you're looking for doesn't exist or you don't have access to it.
        </p>

        <Link to="/dashboard" className={s.homeBtn}>
          <Home size={16} />
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  )
}
