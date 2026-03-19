import s from './Skeleton.module.css'

export function SkeletonRow({ cols = 6 }) {
  return (
    <tr className={s.row}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 14px' }}>
          <div className={s.bar} style={{ width: `${55 + (i * 17) % 35}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonTable({ rows = 6, cols = 6 }) {
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr className={s.head}>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}><div className={s.headBar} style={{ width: `${40 + (i * 13) % 30}%` }} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SkeletonKpi() {
  return (
    <div className={s.kpi}>
      <div className={s.kpiTop}>
        <div className={s.bar} style={{ width: '60%', height: 10 }} />
        <div className={s.iconBox} />
      </div>
      <div className={s.bar} style={{ width: '40%', height: 28, marginTop: 10 }} />
      <div className={s.bar} style={{ width: '55%', height: 9, marginTop: 8 }} />
    </div>
  )
}
