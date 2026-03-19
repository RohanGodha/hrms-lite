import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { User, Lock, Save, Eye, EyeOff, Shield, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { changePassword, updateProfile } from '../api'
import f from '../components/form.module.css'
import s from './Profile.module.css'

export default function Profile() {
  const { user, refreshUser } = useAuth()

  // Profile form
  const [pForm, setPForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [pErrs, setPErrs] = useState({})
  const [pSaving, setPSaving] = useState(false)

  // Password form
  const [wForm, setWForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [wErrs, setWErrs] = useState({})
  const [wSaving, setWSaving] = useState(false)
  const [showCur, setShowCur] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const setP = k => e => setPForm(p => ({ ...p, [k]: e.target.value }))
  const setW = k => e => setWForm(p => ({ ...p, [k]: e.target.value }))

  // ── Update Profile ──────────────────────────────────────────────────────────
  const handleProfile = async ev => {
    ev.preventDefault()
    const e = {}
    if (!pForm.name.trim() || pForm.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!pForm.email)                                        e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pForm.email)) e.email = 'Invalid email'
    if (Object.keys(e).length) { setPErrs(e); return }
    setPSaving(true)
    try {
      const updated = await updateProfile({ name: pForm.name.trim(), email: pForm.email })
      refreshUser(updated)
      toast.success('Profile updated!')
      setPErrs({})
    } catch (err) {
      if (err?.fieldError) setPErrs({ [err.field]: err.message })
      else toast.error(err.message)
    } finally {
      setPSaving(false)
    }
  }

  // ── Change Password ─────────────────────────────────────────────────────────
  const handlePassword = async ev => {
    ev.preventDefault()
    const e = {}
    if (!wForm.current_password)             e.current_password = 'Current password is required'
    if (!wForm.new_password || wForm.new_password.length < 6) e.new_password = 'Min 6 characters'
    if (wForm.new_password !== wForm.confirm) e.confirm = 'Passwords do not match'
    if (wForm.current_password === wForm.new_password) e.new_password = 'New password must differ from current'
    if (Object.keys(e).length) { setWErrs(e); return }
    setWSaving(true)
    try {
      await changePassword({ current_password: wForm.current_password, new_password: wForm.new_password })
      toast.success('Password changed successfully!')
      setWForm({ current_password: '', new_password: '', confirm: '' })
      setWErrs({})
    } catch (err) {
      if (err?.fieldError) setWErrs({ [err.field]: err.message })
      else toast.error(err.message)
    } finally {
      setWSaving(false)
    }
  }

  return (
    <div className={s.page}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className={s.title}>My Profile</h1>
        <p className={s.sub}>Manage your account details and security</p>
      </motion.div>

      <div className={s.grid}>
        {/* ── Profile Info Card ─────────────────────────────────────────────── */}
        <motion.div className={s.card}
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
          <div className={s.cardHead}>
            <div className={s.cardIcon} style={{ background:'var(--accent-dim)', color:'var(--accent)' }}>
              <User size={17} />
            </div>
            <div>
              <h2 className={s.cardTitle}>Profile Information</h2>
              <p className={s.cardSub}>Update your name and email address</p>
            </div>
          </div>

          {/* Avatar display */}
          <div className={s.avatarSection}>
            <div className={s.bigAvatar}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className={s.avatarName}>{user?.name}</div>
              <div className={s.avatarEmail}>{user?.email}</div>
              <div className={s.avatarRole}>
                <Shield size={11} />
                {user?.role}
              </div>
            </div>
          </div>

          <form className={f.form} onSubmit={handleProfile} noValidate>
            <div className={f.field}>
              <label className={f.label}>Full Name</label>
              <input className={`${f.input} ${pErrs.name ? f.inputErr : ''}`}
                value={pForm.name} onChange={setP('name')} placeholder="Your full name" />
              {pErrs.name && <span className={f.err}>{pErrs.name}</span>}
            </div>
            <div className={f.field}>
              <label className={f.label}>Email Address</label>
              <div className={s.inputIcon}>
                <Mail size={14} className={s.inputIconIcon} />
                <input className={`${f.input} ${s.inputWithIcon} ${pErrs.email ? f.inputErr : ''}`}
                  type="email" value={pForm.email} onChange={setP('email')} placeholder="your@email.com" />
              </div>
              {pErrs.email && <span className={f.err}>{pErrs.email}</span>}
            </div>
            <div className={f.actions}>
              <button type="submit" className={f.submitBtn} disabled={pSaving}>
                {pSaving ? <span className={f.spin} /> : <><Save size={14} /> Save Changes</>}
              </button>
            </div>
          </form>
        </motion.div>

        {/* ── Change Password Card ──────────────────────────────────────────── */}
        <motion.div className={s.card}
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
          <div className={s.cardHead}>
            <div className={s.cardIcon} style={{ background:'var(--purple-dim)', color:'var(--purple)' }}>
              <Lock size={17} />
            </div>
            <div>
              <h2 className={s.cardTitle}>Change Password</h2>
              <p className={s.cardSub}>Update your password to keep your account secure</p>
            </div>
          </div>

          <form className={f.form} onSubmit={handlePassword} noValidate>
            <div className={f.field}>
              <label className={f.label}>Current Password</label>
              <div className={s.pwWrap}>
                <input className={`${f.input} ${wErrs.current_password ? f.inputErr : ''}`}
                  type={showCur ? 'text' : 'password'}
                  value={wForm.current_password} onChange={setW('current_password')}
                  placeholder="Your current password" />
                <button type="button" className={s.eyeBtn} onClick={() => setShowCur(v => !v)}>
                  {showCur ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {wErrs.current_password && <span className={f.err}>{wErrs.current_password}</span>}
            </div>

            <div className={f.field}>
              <label className={f.label}>New Password</label>
              <div className={s.pwWrap}>
                <input className={`${f.input} ${wErrs.new_password ? f.inputErr : ''}`}
                  type={showNew ? 'text' : 'password'}
                  value={wForm.new_password} onChange={setW('new_password')}
                  placeholder="Min 6 characters" />
                <button type="button" className={s.eyeBtn} onClick={() => setShowNew(v => !v)}>
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {wErrs.new_password && <span className={f.err}>{wErrs.new_password}</span>}

              {/* Strength indicator */}
              {wForm.new_password && (
                <div className={s.strength}>
                  {[1,2,3,4].map(i => (
                    <div key={i} className={s.strengthBar}
                      style={{ background: passwordStrength(wForm.new_password) >= i
                        ? ['','var(--red)','var(--amber)','var(--green)','var(--green)'][passwordStrength(wForm.new_password)]
                        : 'var(--border)' }} />
                  ))}
                  <span className={s.strengthLabel}>
                    {['','Weak','Fair','Good','Strong'][passwordStrength(wForm.new_password)]}
                  </span>
                </div>
              )}
            </div>

            <div className={f.field}>
              <label className={f.label}>Confirm New Password</label>
              <input className={`${f.input} ${wErrs.confirm ? f.inputErr : ''}`}
                type="password" value={wForm.confirm} onChange={setW('confirm')}
                placeholder="Repeat new password" />
              {wErrs.confirm && <span className={f.err}>{wErrs.confirm}</span>}
            </div>

            <div className={f.actions}>
              <button type="submit" className={f.submitBtn} disabled={wSaving}>
                {wSaving ? <span className={f.spin} /> : <><Lock size={14} /> Update Password</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

function passwordStrength(pw) {
  let score = 0
  if (pw.length >= 6)  score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}
