import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import s from './ThemeToggle.module.css'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button className={s.btn} onClick={toggle} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-label="Toggle theme">
      <span className={`${s.track} ${theme === 'light' ? s.light : ''}`}>
        <span className={s.thumb}>
          {theme === 'dark' ? <Moon size={11} /> : <Sun size={11} />}
        </span>
      </span>
    </button>
  )
}
