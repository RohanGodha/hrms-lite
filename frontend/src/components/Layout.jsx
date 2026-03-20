import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Users, CalendarCheck, Building2, LogOut, Menu, X, ChevronRight, Shield, FileText, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import s from './Layout.module.css'

// Sidebar extracted as a named component so it's stable across renders
function SidebarContent({ nav, user, collapsed, setCollapsed, doLogout }) {
  return (
    <div className={s.sidebarInner}>
      {/* Brand */}
      <div className={s.brand}>
        <div className={s.brandIcon}><Building2 size={18} /></div>
        {!collapsed && <span className={s.brandName}>HRMS<span className={s.brandPro}>Lite</span></span>}
        <button className={s.collapseBtn} onClick={() => setCollapsed(v => !v)} title={collapsed ? 'Expand' : 'Collapse'}>
          <ChevronRight size={14} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.25s' }} />
        </button>
      </div>

      {/* Nav */}
      <nav className={s.nav}>
        {nav.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => [s.navItem, isActive ? s.active : '', collapsed ? s.navCollapsed : ''].join(' ')}>
            <Icon size={17} className={s.navIcon} />
            {!collapsed && <span>{label}</span>}
            {!collapsed && <ChevronRight size={12} className={s.navArrow} />}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
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
        {/* Fix 1: proper sign out button */}
        <button className={`${s.logoutBtn} ${collapsed ? s.logoutCollapsed : ''}`} onClick={doLogout}>
          <LogOut size={15} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  )
}

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [mobile,    setMobile]    = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Close drawer on route change
  useEffect(() => { setMobile(false) }, [location.pathname])

  // Close drawer on resize to desktop
  useEffect(() => {
    const h = () => { if (window.innerWidth > 768) setMobile(false) }
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const nav = [
    { to: '/dashboard',  label: 'Dashboard',   Icon: LayoutDashboard },
    { to: '/employees',  label: 'Employees',    Icon: Users },
    { to: '/attendance', label: 'Attendance',   Icon: CalendarCheck },
    { to: '/profile',    label: 'My Profile',   Icon: UserCircle },
    ...(isAdmin ? [
      { to: '/users', label: 'Users',          Icon: Shield },
      { to: '/logs',  label: 'Activity Logs',  Icon: FileText },
    ] : []),
  ]

  const doLogout = () => { logout(); navigate('/login') }

  const sidebarProps = { nav, user, collapsed, setCollapsed, doLogout }

  return (
    <div className={s.root}>
      {/* Desktop sidebar */}
      <aside className={`${s.sidebar} ${collapsed ? s.sidebarCollapsed : ''}`}>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile drawer + overlay */}
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div className={s.overlay}
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setMobile(false)} />
            <motion.aside className={`${s.sidebar} ${s.drawer}`}
              initial={{ x:-280 }} animate={{ x:0 }} exit={{ x:-280 }}
              transition={{ type:'spring', stiffness:320, damping:32 }}>
              <SidebarContent {...sidebarProps} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`${s.main} ${collapsed ? s.mainCollapsed : ''}`}>
        {/* Mobile topbar */}
        <header className={s.topbar}>
          <button className={s.menuBtn} onClick={() => setMobile(v => !v)}>
            {mobile ? <X size={19} /> : <Menu size={19} />}
          </button>
          <div className={s.topbarBrand}>
            <Building2 size={17} style={{ color:'var(--accent)' }} />
            HRMS<span className={s.topbarBrandPro}>Lite</span>
          </div>
          <div className={s.topbarRight}>
            <ThemeToggle />
            <NavLink to="/profile">
              <div className={s.topbarAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
            </NavLink>
          </div>
        </header>

        <div className={s.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
