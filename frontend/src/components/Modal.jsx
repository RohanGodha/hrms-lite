import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, width = 500 }) {
  useEffect(() => {
    if (!isOpen) return
    const h = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          onClick={onClose}>
          <motion.div
            style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', width:'100%', maxWidth:width, boxShadow:'var(--shadow-lg)' }}
            initial={{ scale:.94, y:20, opacity:0 }}
            animate={{ scale:1, y:0, opacity:1 }}
            exit={{ scale:.94, y:20, opacity:0 }}
            transition={{ type:'spring', stiffness:300, damping:28 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid var(--border)' }}>
              <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text)', fontFamily:'var(--font-display)' }}>{title}</h2>
              <button onClick={onClose} style={{ width:28, height:28, borderRadius:8, background:'transparent', color:'var(--text-3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'background .15s, color .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--bg-3)'; e.currentTarget.style.color='var(--text)' }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-3)' }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding:24 }}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
