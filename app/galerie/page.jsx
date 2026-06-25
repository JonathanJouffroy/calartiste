'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ArtworkCard from '@/components/ArtworkCard'
import Footer from '@/components/Footer'

export default function GaleriePage() {
  const [artworks, setArtworks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Chargement initial
    const load = async () => {
      const { data } = await supabase
        .from('artworks').select('*').order('sort_order').order('created_at')
      setArtworks(data || [])
      setLoading(false)
    }
    load()

    // Abonnement Realtime — mise à jour instantanée dès qu'une œuvre change
    const channel = supabase
      .channel('artworks-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'artworks' },
        () => { load() } // recharge toute la liste à chaque changement
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const categories = [...new Set(artworks.map(a => a.category).filter(Boolean))]
  const filtered = filter === 'all' ? artworks : artworks.filter(a => a.category === filter)

  return (
    <>
      <div style={{paddingTop:80}}>
        <div style={{padding:'60px 48px 40px', borderBottom:'1px solid rgba(197,110,74,0.2)'}}>
          <h1 style={{fontFamily:"'Cormorant Garant', serif", fontSize:56, fontWeight:300}}>La Galerie</h1>
          <p style={{color:'var(--stone)', fontSize:13, marginTop:8}}>
            {loading ? 'Chargement…' : `${filtered.length} œuvre${filtered.length > 1 ? 's' : ''}`}
          </p>
        </div>

        <div style={{padding:'20px 48px', display:'flex', gap:8, flexWrap:'wrap', borderBottom:'1px solid rgba(197,110,74,0.1)'}}>
          {['all', ...categories].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              padding:'6px 18px', border:'1px solid',
              borderColor: filter === cat ? 'var(--gold)' : 'rgba(197,110,74,0.25)',
              background: filter === cat ? 'var(--gold)' : 'transparent',
              color: filter === cat ? '#e9e5da' : 'var(--stone)',
              fontSize:11, fontWeight:500, letterSpacing:'0.1em',
              textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter, sans-serif'
            }}>
              {cat === 'all' ? 'Tout' : cat}
            </button>
          ))}
        </div>

        <div style={{padding:48, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:32}}>
          {loading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} style={{aspectRatio:'3/4', background:'var(--light)', animation:'pulse 1.5s infinite'}}/>
              ))
            : filtered.length === 0
              ? <div style={{gridColumn:'1/-1', textAlign:'center', padding:'80px 0', color:'var(--stone)'}}>Aucune œuvre dans cette catégorie.</div>
              : filtered.map(a => <ArtworkCard key={a.id} artwork={a}/>)
          }
        </div>
      </div>
      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </>
  )
}
