export default function Footer() {
  return (
    <footer style={{
      background:'#d4d0c7', borderTop:'1px solid rgba(197,110,74,0.2)',
      color:'rgba(42,37,32,0.5)', padding:'40px 48px',
      display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12,
      flexWrap:'wrap', gap:16
    }}>
      <span style={{fontFamily:"'Cormorant Garant', serif", fontSize:18, color:'var(--gold)'}}>Calar.Artiste</span>
      <a href="https://www.instagram.com/calar.artiste" target="_blank" rel="noopener"
        style={{display:'flex', alignItems:'center', gap:8, color:'var(--gold)', fontSize:12, fontWeight:500}}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="0.8" fill="var(--gold)" stroke="none"/>
        </svg>
        @calar.artiste
      </a>
      <span>© 2026 · Calar.Artiste · Tous droits réservés</span>
    </footer>
  )
}
