import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarCheck, Building2 } from 'lucide-react'
import styles from './Layout.module.css'

const NAV = [
  { to: '/dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
  { to: '/employees',  label: 'Employees',  Icon: Users },
  { to: '/attendance', label: 'Attendance', Icon: CalendarCheck },
]

export default function Layout() {
  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Building2 size={22} className={styles.brandIcon} />
          <span className={styles.brandName}>HRMS<span className={styles.brandLite}>Lite</span></span>
        </div>

        <nav className={styles.nav}>
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <Icon size={17} className={styles.navIcon} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminBadge}>
            <div className={styles.adminAvatar}>A</div>
            <div>
              <div className={styles.adminName}>Admin</div>
              <div className={styles.adminRole}>HR Manager</div>
            </div>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
