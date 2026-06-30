'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ArtworkCard from '@/components/ArtworkCard'
import { useLang } from '@/lib/LangContext'

const DEFAULTS_FR = {
  heroLine1: "L'art qui fait", heroLine2: 'voyager',
  heroDesc: 'Entre émotion et nature — chaque toile de Clara est un voyage intérieur peint avec sincérité et énergie.',
  heroBtn: 'Voir les œuvres', heroEyebrow: 'Art intuitif & abstrait',
  aboutLine1: 'Infirmière', aboutLine2: 'artiste',
  aboutText: "Clara est artiste, passionnée et créative.",
  commandeTitle: 'Une œuvre unique,', commandeTitleItalic: 'rien que pour vous',
  commandeDesc: "Clara réalise des œuvres personnalisées selon vos envies : couleurs, dimensions, thème, émotion… Chaque commande est une collaboration unique entre l'artiste et vous.",
  commandeBtn: 'Faire une demande',
  commandeFeatures: JSON.stringify([
    { icon:'🎨', title:'Choix des couleurs', desc:'Palette adaptée à votre intérieur ou vos préférences' },
    { icon:'📐', title:'Format sur mesure', desc:'Du petit format encadrable au grand format mural' },
    { icon:'💬', title:'Échange & création', desc:'Un dialogue avec Clara pour affiner votre vision' },
    { icon:'✨', title:'Œuvre unique', desc:"Signée et certifiée originale par l'artiste" },
  ]),
}

const DEFAULTS_EN = {
  heroLine1: 'The art that takes you', heroLine2: 'on a journey',
  heroDesc: "Between emotion and nature — each of Clara's paintings is an inner journey painted with sincerity and energy.",
  heroBtn: 'View the artworks', heroEyebrow: 'Intuitive & abstract art',
  aboutLine1: 'Artist', aboutLine2: 'and creator',
  aboutText: 'Clara is a passionate and creative artist.',
  commandeTitle: 'A unique artwork,', commandeTitleItalic: 'just for you',
  commandeDesc: "Clara creates personalized artworks based on your wishes: colors, dimensions, theme, emotion… Each commission is a unique collaboration between the artist and you.",
  commandeBtn: 'Make a request',
  commandeFeatures: JSON.stringify([
    { icon:'🎨', title:'Choice of colors', desc:'Palette adapted to your interior or preferences' },
    { icon:'📐', title:'Custom size', desc:'From small framable format to large mural format' },
    { icon:'💬', title:'Exchange & creation', desc:'A dialogue with Clara to refine your vision' },
    { icon:'✨', title:'Unique artwork', desc:'Signed and certified original by the artist' },
  ]),
}

export default function HomePage() {
  const { lang, t } = useLang()
  const [artworks, setArtworks] = useState([])
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [{ data: artworksData }, { data: settingsData }] = await Promise.all([
        supabase.from('artworks').select('*').order('sort_order').order('created_at'),
        supabase.from('settings').select('key, value')
      ])
      setArtworks(artworksData || [])
      const s = {}
      ;(settingsData || []).forEach(r => { s[r.key] = r.value })
      setSettings(s)
      setLoading(false)
    }
    load()
  }, [])

  // Récupère un champ avec fallback EN -> défaut EN -> défaut FR
  const get = (key) => {
    const defaults = lang === 'en' ? DEFAULTS_EN : DEFAULTS_FR
    if (lang === 'en') {
      return settings[`${key}_en`] || defaults[key]
    }
    return settings[key] || defaults[key]
  }

  const recentIds = [settings.recentId1, settings.recentId2, settings.recentId3].filter(Boolean)
  const recent = recentIds.length > 0
    ? recentIds.map(id => artworks.find(a => String(a.id) === String(id))).filter(Boolean)
    : artworks.slice(0, 3)

  let features = []
  try { features = JSON.parse(get('commandeFeatures')) } catch {}

  return (
    <>
      {/* HERO */}
      <section className="home-hero" style={{
        paddingTop:80,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        textAlign:'center', padding:'120px 24px 64px',
        background:'var(--cream)'
      }}>
        <p className="home-hero-eyebrow" style={{fontSize:11, fontWeight:500, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--blue)', marginBottom:20}}>
          {get('heroEyebrow')}
        </p>
        <h1 className="home-hero-title" style={{fontFamily:"'Cormorant Garant', serif", fontSize:'clamp(40px, 9vw, 88px)', fontWeight:300, lineHeight:1.08, marginBottom:24, maxWidth:800}}>
          {get('heroLine1')}<br/>
          <em style={{fontStyle:'italic', color:'var(--gold)'}}>{get('heroLine2')}</em>
        </h1>
        <p className="home-hero-desc" style={{fontSize:16, color:'var(--stone)', lineHeight:1.85, maxWidth:520, marginBottom:40, whiteSpace:'pre-wrap'}}>
          {get('heroDesc')}
        </p>
        <Link href="/galerie" className="home-hero-btn" style={{
          display:'inline-block', padding:'14px 40px',
          background:'var(--gold)', color:'#e9e5da',
          fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase'
        }}>
          {get('heroBtn')}
        </Link>
      </section>

      {/* RECENT WORKS */}
      <section className="home-section-pad" style={{padding:'64px 24px', background:'var(--cream)'}}>
        <div className="home-section-header" style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:36, flexWrap:'wrap', gap:12}}>
          <h2 style={{fontFamily:"'Cormorant Garant', serif", fontSize:'clamp(28px, 5vw, 36px)', fontWeight:300}}>
            {lang === 'en' ? 'Recent artworks' : 'Œuvres récentes'}
          </h2>
          <Link href="/galerie" style={{fontSize:11, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--stone)'}}>
            {lang === 'en' ? 'View full gallery →' : 'Voir toute la galerie →'}
          </Link>
        </div>
        <div className="home-recent-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:24}}>
          {recent.map(a => <ArtworkCard key={a.id} artwork={a} />)}
        </div>
      </section>

      {/* COMMANDE PERSONNALISÉE */}
      <section className="home-commande" style={{
        background:'var(--black)', padding:'64px 24px',
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center'
      }}>
        <div>
          <p style={{fontSize:11, fontWeight:500, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--gold)', marginBottom:16}}>
            {t('custom')}
          </p>
          <h2 style={{fontFamily:"'Cormorant Garant', serif", fontSize:'clamp(28px, 5vw, 44px)', fontWeight:300, lineHeight:1.15, color:'var(--cream)', marginBottom:20}}>
            {get('commandeTitle')}<br/><em style={{fontStyle:'italic', color:'var(--gold)'}}>{get('commandeTitleItalic')}</em>
          </h2>
          <p style={{fontSize:14, lineHeight:1.8, color:'rgba(233,229,218,0.65)', marginBottom:32, maxWidth:420, whiteSpace:'pre-wrap'}}>
            {get('commandeDesc')}
          </p>
          <Link href="/a-propos#contact" style={{
            display:'inline-block', padding:'14px 32px',
            background:'var(--gold)', color:'var(--cream)',
            fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase'
          }}>
            {get('commandeBtn')}
          </Link>
        </div>
        <div className="home-commande-features" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          {features.map(({ icon, title, desc }) => (
            <div key={title} style={{padding:16, background:'rgba(233,229,218,0.05)', border:'1px solid rgba(233,229,218,0.08)'}}>
              <div style={{fontSize:22, marginBottom:8}}>{icon}</div>
              <div style={{fontFamily:"'Cormorant Garant', serif", fontSize:15, fontWeight:400, color:'var(--cream)', marginBottom:5}}>{title}</div>
              <div style={{fontSize:11, color:'rgba(233,229,218,0.5)', lineHeight:1.55}}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="home-about" style={{
        background:'#dedad3', borderTop:'2px solid var(--gold)', borderBottom:'2px solid var(--gold)',
        padding:'64px 24px', display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:48, alignItems:'center'
      }}>
        <h2 style={{fontFamily:"'Cormorant Garant', serif", fontSize:'clamp(28px, 5vw, 44px)', fontWeight:300, lineHeight:1.15}}>
          {get('aboutLine1')}<br/>& <em style={{fontStyle:'italic', color:'var(--gold)'}}>{get('aboutLine2')}</em>
        </h2>
        <p style={{fontSize:14, lineHeight:1.8, color:'var(--stone)', whiteSpace:'pre-wrap'}}>
          {get('aboutText')}
        </p>
      </section>

      {/* FOOTER */}
      <footer className="home-footer" style={{
        background:'#d4d0c7', borderTop:'1px solid rgba(197,110,74,0.2)',
        color:'rgba(42,37,32,0.5)', padding:'32px 24px',
        display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12,
        flexWrap:'wrap', gap:16, textAlign:'center'
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
        <span>© 2026 · Calar.Artiste · {t('footer.rights')}</span>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .home-hero { padding: 100px 20px 48px !important; }
          .home-commande,
          .home-about {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            text-align: left;
          }
          .home-commande-features {
            grid-template-columns: 1fr 1fr !important;
          }
          .home-section-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .home-footer {
            flex-direction: column !important;
            text-align: center !important;
          }
        }
        @media (max-width: 480px) {
          .home-recent-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .home-commande-features { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
