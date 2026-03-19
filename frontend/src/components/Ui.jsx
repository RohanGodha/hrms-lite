/* Spinner */
export function Spinner({ size = 36 }) {
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:'56px 0' }}>
      <div style={{ width:size, height:size, border:'2px solid var(--border-2)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
    </div>
  )
}

/* Badge */
export function Badge({ status }) {
  const ok = status === 'Present'
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'3px 10px 3px 8px', borderRadius:99,
      fontSize:12, fontWeight:500,
      background: ok ? 'var(--green-dim)' : 'var(--red-dim)',
      color: ok ? 'var(--green)' : 'var(--red)',
      border: `1px solid ${ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
    }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background: ok ? 'var(--green)' : 'var(--red)', flexShrink:0 }} />
      {status}
    </span>
  )
}

/* RoleBadge */
export function RoleBadge({ role }) {
  const isAdmin = role === 'admin'
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 10px', borderRadius:99,
      fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em',
      background: isAdmin ? 'var(--purple-dim)' : 'var(--accent-dim)',
      color: isAdmin ? 'var(--purple)' : 'var(--accent)',
      border: `1px solid ${isAdmin ? 'rgba(139,92,246,0.2)' : 'rgba(59,130,246,0.2)'}`,
    }}>
      {role}
    </span>
  )
}
