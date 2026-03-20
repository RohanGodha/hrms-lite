import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Building2, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import { loginUser } from '../api'
import { useAuth } from '../context/AuthContext'
import ThreeBackground from '../components/ThreeBackground'
import s from './Auth.module.css'

export default function Login() {
  const { login } = useAuth()
  const nav       = useNavigate()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [show, setShow]   = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await loginUser(form)
      login(data.access_token, data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
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

        <div className={s.logo}>
          <Building2 size={24} />
        </div>
        <h1 className={s.title}>Welcome back</h1>
        <p className={s.sub}>Sign in to your HRMS Lite account</p>

        <form className={s.form} onSubmit={submit}>
          <div className={s.field}>
            <Mail size={15} className={s.fieldIcon} />
            <input className={s.input} type="email" placeholder="Email address"
              value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} required />
          </div>
          <div className={s.field}>
            <Lock size={15} className={s.fieldIcon} />
            <input className={s.input} type={show?'text':'password'} placeholder="Password"
              style={{ paddingRight: 40 }}
              value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required />
            <button type="button" className={s.eyeBtn} onClick={()=>setShow(v=>!v)}>
              {show ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
          <button className={s.submitBtn} type="submit" disabled={loading}>
            {loading ? <span className={s.btnSpinner}/> : <><LogIn size={15}/> Sign In</>}
          </button>
        </form>

        <div className={s.hint}>
          <span className={s.hintLabel}>Default admin:</span>
          <code className={s.hintCode}>admin@hrms.com / admin1234</code>
        </div>

        <p className={s.switchText}>
          Don't have an account?{' '}
          <Link to="/register" className={s.switchLink}>Create one</Link>
        </p>
      </motion.div>
    </div>
  )
}
