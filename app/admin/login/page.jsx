'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const login = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    const data = await res.json()
    if (res.ok) {
      sessionStorage.setItem('calar_admin', data.token)
      router.push('/admin')
    } else {
      setError(data.error || 'Mot de passe incorrect')
      setPassword('')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--cream)', paddingTop:80
    }}>
      <div style={{
        background:'var(--cream)', padding:'56px 48px', width:'100%', maxWidth:420,
        border:'1px solid rgba(197,110,74,0.2)',
        boxShadow:'0 40px 80px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{fontFamily:"'Cormorant Garant', serif", fontSize:32, fontWeight:300, marginBottom:6}}>Espace Admin</h1>
        <p style={{fontSize:12, color:'var(--stone)', marginBottom:36, letterSpacing:'0.05em'}}>Accès réservé à l'administrateur</p>

        {error && (
          <div style={{fontSize:12, color:'#c44', padding:'10px 14px', background:'rgba(196,49,43,0.08)', border:'1px solid rgba(196,49,43,0.2)', marginBottom:20}}>
            {error}
          </div>
        )}

        <form onSubmit={login} style={{display:'grid', gap:20}}>
          <div style={{display:'grid', gap:8}}>
            <label style={{fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--stone)'}}>Mot de passe</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="••••••••"
              style={{border:'1px solid rgba(197,110,74,0.2)', padding:'11px 12px', fontSize:14, background:'var(--light)', color:'var(--black)', outline:'none', width:'100%'}}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            padding:'14px', background:'var(--gold)', color:'#e9e5da',
            border:'none', cursor:'pointer', fontSize:11, fontWeight:600,
            letterSpacing:'0.14em', textTransform:'uppercase'
          }}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
