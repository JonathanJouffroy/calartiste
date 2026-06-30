'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ArtworkCard from '@/components/ArtworkCard'
import Footer from '@/components/Footer'

const PRICE_RANGES = [
  { label: 'Tous les prix', value: 'all' },
  { label: '< 100 €', value: '0-100' },
  { label: '100 – 300 €', value: '100-300' },
  { label: '> 300 €', value: '300+' },
]

const AVAILABILITY_OPTIONS = ['Disponible', 'Vendu']

const DEFAULT_BANDEAU = {
  bandeauTitle:  'Vous souhaitez une œuvre',
  bandeauItalic: 'unique & personnalisée ?',
  bandeauDesc:   'Clara crée sur commande — couleurs, format et thème selon vos envies.',
  bandeauBtn:    'Faire une demande',
}

export default function GaleriePage() {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [bandeau, setBandeau] = useState(DEFAULT_BANDEAU)

  const [category, setCategory] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [availability, setAvailability] = useState('all')

  useEffect(() => {
    document.title = 'Galerie — Peintures originales à vendre | Art intuitif & abstrait · Calar.Artiste'
    const load = async () => {
      const [{ data: artworksData }, { data: settingsData }] = await Promise.all([
        supabase.from('artworks').select('*').order('sort_order').order('created_at'),
        supabase.from('settings').select('key, value').in('key', ['bandeauTitle','bandeauItalic','bandeauDesc','bandeauBtn'])
      ])
      setArtworks(artworksData || [])
      if (settingsData) {
        const s = { ...DEFAULT_BANDEAU }
        settingsData.forEach(r => { if (r.key in s) s[r.key] = r.value })
        setBandeau(s)
      }
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('artworks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'artworks' }, () => load())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const categories = [...new Map(
    artworks.map(a => a.category).filter(Boolean)
      .map(c => [c.toLowerCase().trim(), c])
  ).values()]

  const filtered = artworks.filter(a => {
    if (category !== 'all' && a.category?.toLowerCase().trim() !== category.toLowerCase().trim()) return false
    if (availability !== 'all' && a.availability !== availability) return false
    if (priceRange !== 'all') {
      const p = parseFloat(a.price) || 0
      if (priceRange === '0-100' && p >= 100) return false
      if (priceRange === '100-300' && (p < 100 || p >= 300)) return false
      if (priceRange === '300+' && p < 300) return false
    }
    return true
  })

  const hasActiveFilters = category !== 'all' || priceRange !== 'all' || availability !== 'all'

  const resetFilters = () => {
    setCategory('all')
    setPriceRange('all')
    setAvailability('all')
  }

  const FilterBtn = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{
      padding:'6px 14px', border:'1px solid',
      borderColor: active ? 'var(--gold)' : 'rgba(197,110,74,0.25)',
      background: active ? 'var(--gold)' : 'transparent',
      color: active ? '#e9e5da' : 'var(--stone)',
      fontSize:11, fontWeight:500, letterSpacing:'0.08em',
      textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter, sans-serif',
      transition:'all 0.15s', whiteSpace:'nowrap'
    }}>{children}</button>
  )

  return (
    <>
      <div style={{paddingTop:80}}>
        {/* Header */}
        <div className="gal-header" style={{padding:'48px 24px 28px', borderBottom:'1px solid rgba(197,110,74,0.2)'}}>
          <div className="gal-header-row" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:16}}>
            <div>
              <h1 style={{fontFamily:"'Cormorant Garant', serif", fontSize:'clamp(36px, 8vw, 56px)', fontWeight:300}}>La Galerie</h1>
              <p style={{color:'var(--stone)', fontSize:13, marginTop:8}}>
                {loading ? 'Chargement…' : `${filtered.length} œuvre${filtered.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <div style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap'}}>
              {hasActiveFilters && (
                <button onClick={resetFilters} style={{
                  fontSize:11, color:'var(--gold)', background:'none', border:'none',
                  cursor:'pointer', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase',
                  textDecoration:'underline'
                }}>Effacer les filtres</button>
              )}
              <button onClick={() => setShowFilters(f => !f)} style={{
                padding:'8px 18px', border:'1px solid rgba(197,110,74,0.3)',
                background: showFilters ? 'var(--black)' : 'transparent',
                color: showFilters ? '#e9e5da' : 'var(--stone)',
                fontSize:11, fontWeight:500, letterSpacing:'0.1em',
                textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter, sans-serif',
                display:'flex', alignItems:'center', gap:8
              }}>
                ⚙ Filtres {hasActiveFilters && <span style={{
                  background:'var(--gold)', color:'#e9e5da', borderRadius:'50%',
                  width:18, height:18, display:'inline-flex', alignItems:'center', justifyContent:'center',
                  fontSize:10, fontWeight:700
                }}>{[category!=='all',priceRange!=='all',availability!=='all'].filter(Boolean).length}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Catégories — toujours visibles, scrollables sur mobile */}
        <div className="gal-categories" style={{padding:'14px 24px', display:'flex', gap:8, flexWrap:'wrap', borderBottom:'1px solid rgba(197,110,74,0.1)', overflowX:'auto'}}>
          <FilterBtn active={category === 'all'} onClick={() => setCategory('all')}>Tout</FilterBtn>
          {categories.map(c => (
            <FilterBtn key={c} active={category === c} onClick={() => setCategory(c)}>{c}</FilterBtn>
          ))}
        </div>

        {/* Panneau filtres */}
        {showFilters && (
          <div className="gal-filters-panel" style={{
            padding:'20px 24px', background:'var(--light)',
            borderBottom:'1px solid rgba(197,110,74,0.15)',
            display:'grid', gridTemplateColumns:'1fr 1fr', gap:32
          }}>
            <div>
              <p style={{fontSize:10, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--stone)', marginBottom:12}}>Prix</p>
              <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                {PRICE_RANGES.map(r => (
                  <FilterBtn key={r.value} active={priceRange === r.value} onClick={() => setPriceRange(r.value)}>{r.label}</FilterBtn>
                ))}
              </div>
            </div>
            <div>
              <p style={{fontSize:10, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--stone)', marginBottom:12}}>Disponibilité</p>
              <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                <FilterBtn active={availability === 'all'} onClick={() => setAvailability('all')}>Toutes</FilterBtn>
                {AVAILABILITY_OPTIONS.map(o => (
                  <FilterBtn key={o} active={availability === o} onClick={() => setAvailability(o)}>{o}</FilterBtn>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grille */}
        <div className="gal-grid" style={{padding:24, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:24}}>
          {loading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} style={{aspectRatio:'3/4', background:'var(--light)', animation:'pulse 1.5s infinite'}}/>
              ))
            : filtered.length === 0
              ? (
                <div style={{gridColumn:'1/-1', textAlign:'center', padding:'60px 0', color:'var(--stone)'}}>
                  <div style={{fontSize:40, marginBottom:16, opacity:0.3}}>🎨</div>
                  <p style={{marginBottom:12}}>Aucune œuvre ne correspond à vos filtres.</p>
                  <button onClick={resetFilters} style={{
                    fontSize:11, color:'var(--gold)', background:'none', border:'none',
                    cursor:'pointer', fontWeight:500, textDecoration:'underline'
                  }}>Effacer les filtres</button>
                </div>
              )
              : filtered.map(a => <ArtworkCard key={a.id} artwork={a}/>)
          }
        </div>
      </div>

      {/* BANNIÈRE COMMANDE PERSONNALISÉE */}
      <div className="gal-bandeau" style={{
        background:'var(--light)', borderTop:'1px solid rgba(197,110,74,0.2)',
        borderBottom:'1px solid rgba(197,110,74,0.2)',
        padding:'32px 24px',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap'
      }}>
        <div>
          <p style={{fontFamily:"'Cormorant Garant', serif", fontSize:'clamp(18px, 4vw, 24px)', fontWeight:300, color:'var(--black)', marginBottom:6}}>
            {bandeau.bandeauTitle} <em style={{fontStyle:'italic', color:'var(--gold)'}}>{bandeau.bandeauItalic}</em>
          </p>
          <p style={{fontSize:13, color:'var(--stone)'}}>
            {bandeau.bandeauDesc}
          </p>
        </div>
        <a href="/a-propos#contact" style={{
          display:'inline-block', padding:'12px 28px', flexShrink:0,
          background:'var(--gold)', color:'var(--cream)',
          fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase',
          textDecoration:'none'
        }}>{bandeau.bandeauBtn}</a>
      </div>

      <Footer />
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @media (max-width: 768px) {
          .gal-header { padding: 32px 16px 20px !important; }
          .gal-categories { padding: 12px 16px !important; flex-wrap: nowrap !important; }
          .gal-filters-panel { grid-template-columns: 1fr !important; padding: 16px !important; gap: 24px !important; }
          .gal-grid { padding: 16px !important; grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .gal-bandeau { padding: 24px 16px !important; flex-direction: column !important; align-items: flex-start !important; }
          .gal-bandeau a { width: 100%; text-align: center; box-sizing: border-box; }
        }
        @media (max-width: 380px) {
          .gal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
