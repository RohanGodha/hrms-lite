import styles from './StatCard.module.css'

export default function StatCard({ label, value, icon: Icon, color = 'accent', delta }) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {Icon && (
          <div className={styles.iconWrap}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className={styles.value}>{value ?? '—'}</div>
      {delta != null && (
        <div className={styles.delta}>{delta}</div>
      )}
    </div>
  )
}
