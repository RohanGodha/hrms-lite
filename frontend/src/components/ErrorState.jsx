import { AlertTriangle } from 'lucide-react'
import styles from './ErrorState.module.css'

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.iconWrap}>
        <AlertTriangle size={24} />
      </div>
      <h3 className={styles.title}>Failed to load</h3>
      <p className={styles.msg}>{message}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
