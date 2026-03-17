import styles from './Badge.module.css'

export default function Badge({ status }) {
  const isPresent = status === 'Present'
  return (
    <span className={`${styles.badge} ${isPresent ? styles.present : styles.absent}`}>
      <span className={styles.dot} />
      {status}
    </span>
  )
}
