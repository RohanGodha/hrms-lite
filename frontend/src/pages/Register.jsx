import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Building2, Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react'
import { registerUser } from '../api'
import { useAuth } from '../context/AuthContext'
import ThreeBackground from '../components/ThreeBackground'
import s from './Auth.module.css'

export default function Register() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm]   = useState({ name:'', email:'', password:'', role:'user' })
  const [show, setShow]   = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be 6+ characters'); return }
    setLoading(true)
    try {
      const data = await registerUser(form)
      login(data.access_token, data.user)
      toast.success(`Account created! Welcome, ${data.user.name}!`)
      nav('/dashboard')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.page}>
      <ThreeBackground />
      <motion.div className={s.card}
        initial={{ opacity:0, y:30, scale:0.96 }}
        animate={{ opacity:1, y:0,  scale:1 }}
        transition={{ duration:0.5, ease:[.16,1,.3,1] }}>

        <div className={s.logo}><Building2 size={24}/></div>
        <h1 className={s.title}>Create account</h1>
        <p className={s.sub}>Join HRMS Lite — your team HR platform</p>

        <form className={s.form} onSubmit={submit}>
          <div className={s.field}>
            <User size={15} className={s.fieldIcon}/>
            <input className={s.input} placeholder="Full name"
              value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required/>
          </div>
          <div className={s.field}>
            <Mail size={15} className={s.fieldIcon}/>
            <input className={s.input} type="email" placeholder="Email address"
              value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} required/>
          </div>
          <div className={s.field}>
            <Lock size={15} className={s.fieldIcon}/>
            <input className={s.input} type={show?'text':'password'} placeholder="Password (6+ chars)"
              value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required/>
            <button type="button" className={s.eyeBtn} onClick={()=>setShow(v=>!v)}>
              {show ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
          <div className={s.roleRow}>
            {['user','admin'].map(r=>(
              <button key={r} type="button"
                className={`${s.roleBtn} ${form.role===r?s.roleActive:''}`}
                onClick={()=>setForm(p=>({...p,role:r}))}>
                {r==='user'?'👤 Member':'🛡️ Admin'}
              </button>
            ))}
          </div>
          <button className={s.submitBtn} type="submit" disabled={loading}>
            {loading ? <span className={s.btnSpinner}/> : <><UserPlus size={15}/> Create Account</>}
          </button>
        </form>

        <p className={s.switchText}>
          Already have an account?{' '}
          <Link to="/login" className={s.switchLink}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
