export default function Spinner({ size = 36 }) {
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:'56px 0' }}>
      <div style={{ width:size, height:size, border:'2px solid var(--border-2)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
    </div>
  )
}
