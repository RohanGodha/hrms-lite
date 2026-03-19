import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Users, CalendarCheck, Building2, LogOut, Menu, X, ChevronRight, Shield, FileText, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import s from './Layout.module.css'

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobile, setMobile] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => { setMobile(false) }, [location.pathname])
  useEffect(() => {
    const h = () => { if (window.innerWidth > 768) setMobile(false) }
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const nav = [
    { to: '/dashboard',  label: 'Dashboard',    Icon: LayoutDashboard },
    { to: '/employees',  label: 'Employees',     Icon: Users },
    { to: '/attendance', label: 'Attendance',    Icon: CalendarCheck },
    { to: '/profile',    label: 'My Profile',    Icon: UserCircle },
    ...(isAdmin ? [
      { to: '/users', label: 'Users',         Icon: Shield },
      { to: '/logs',  label: 'Activity Logs', Icon: FileText },
    ] : []),
  ]

  const doLogout = () => { logout(); navigate('/login') }

  const SidebarContent = () => (
    <div className={s.sidebarInner}>
      <div className={s.brandRow}>
        <div className={s.brand}>
          <Building2 size={20} className={s.brandIcon} />
          {!collapsed && <span className={s.brandName}>HRMS<span className={s.brandPro}>Pro</span></span>}
        </div>
        <button className={s.collapseBtn} onClick={() => setCollapsed(v => !v)}>
          <ChevronRight size={15} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
        </button>
      </div>
      <nav className={s.nav}>
        {nav.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''} ${collapsed ? s.navCollapsed : ''}`}>
            <Icon size={17} className={s.navIcon} />
            {!collapsed && <span>{label}</span>}
            {!collapsed && <ChevronRight size={13} className={s.navArrow} />}
          </NavLink>
        ))}
      </nav>
      <div className={s.sidebarBottom}>
        {!collapsed && (
          <div className={s.userCard}>
            <div className={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div className={s.userInfo}>
              <div className={s.userName}>{user?.name}</div>
              <div className={s.userRole}>{user?.role}</div>
            </div>
          </div>
        )}
        <button className={`${s.logoutBtn} ${collapsed ? s.logoutCollapsed : ''}`} onClick={doLogout}>
          <LogOut size={15} />{!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className={`${s.root} ${collapsed ? s.rootCollapsed : ''}`}>
      <aside className={`${s.sidebar} ${collapsed ? s.sidebarCollapsed : ''}`}><SidebarContent /></aside>
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div className={s.overlay} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setMobile(false)} />
            <motion.aside className={`${s.sidebar} ${s.mobileSidebar}`} initial={{ x:-280 }} animate={{ x:0 }} exit={{ x:-280 }} transition={{ type:'spring', stiffness:300, damping:30 }}>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className={s.main}>
        <header className={s.topbar}>
          <button className={s.menuBtn} onClick={() => setMobile(v => !v)}>
            {mobile ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className={s.topbarRight}>
            <ThemeToggle />
            <NavLink to="/profile" className={s.topbarUser}>
              <div className={s.topbarAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
              <div className={s.topbarMeta}>
                <span className={s.topbarName}>{user?.name}</span>
                <span className={s.topbarRole}>{user?.role}</span>
              </div>
            </NavLink>
          </div>
        </header>
        <div className={s.content}><Outlet /></div>
      </div>
    </div>
  )
}
