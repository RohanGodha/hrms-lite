import styles from './Spinner.module.css'

export default function Spinner({ size = 32, label = 'Loading…' }) {
  return (
    <div className={styles.wrap} role="status" aria-label={label}>
      <div className={styles.ring} style={{ width: size, height: size }} />
    </div>
  )
}
