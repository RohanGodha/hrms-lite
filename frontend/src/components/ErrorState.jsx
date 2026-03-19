import { AlertTriangle } from 'lucide-react'
export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 24px', gap:12, textAlign:'center' }}>
      <div style={{ width:52, height:52, borderRadius:14, background:'var(--red-dim)', border:'1px solid rgba(239,68,68,.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--red)' }}>
        <AlertTriangle size={22} />
      </div>
      <h3 style={{ fontSize:15, fontWeight:500, color:'var(--text)' }}>Failed to load</h3>
      <p style={{ fontSize:13, color:'var(--text-3)', maxWidth:300 }}>{message}</p>
      {onRetry && <button onClick={onRetry} style={{ marginTop:8, padding:'8px 20px', borderRadius:'var(--radius)', background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--text-2)', fontSize:13, cursor:'pointer' }}>Try again</button>}
    </div>
  )
}
