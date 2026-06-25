import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import ArtworkCard from '@/components/ArtworkCard'

async function getHomeData() {
  const [{ data: artworks }, { data: settings }] = await Promise.all([
    supabase.from('artworks').select('*').order('sort_order').order('created_at'),
    supabase.from('settings').select('key, value')
  ])

  const s = {}
  ;(settings || []).forEach(r => { s[r.key] = r.value })

  return {
    artworks: artworks || [],
    settings: {
      heroLine1:   s.heroLine1   || "L'art qui fait",
      heroLine2:   s.heroLine2   || 'voyager',
      heroDesc:    s.heroDesc    || 'Entre émotion, nature et guérison — chaque toile de Clara est un voyage intérieur peint avec sincérité et énergie.',
      heroBtn:     s.heroBtn     || 'Voir les œuvres',
      heroEyebrow: s.heroEyebrow || 'Art intuitif & abstrait',
      aboutLine1:  s.aboutLine1  || 'Infirmière',
      aboutLine2:  s.aboutLine2  || 'artiste',
      aboutText:   s.aboutText   || "Clara est infirmière le jour, artiste en permanence.",
      featuredId:  s.featuredId  || null,
      recentId1:   s.recentId1   || null,
      recentId2:   s.recentId2   || null,
      recentId3:   s.recentId3   || null,
    }
  }
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { artworks, settings } = await getHomeData()

  const featured = settings.featuredId
    ? artworks.find(a => String(a.id) === String(settings.featuredId)) || artworks[0]
    : artworks[0]

  // Œuvres récentes — manuelles si définies, sinon automatique
  const recentIds = [settings.recentId1, settings.recentId2, settings.recentId3].filter(Boolean)
  const recent = recentIds.length > 0
    ? recentIds.map(id => artworks.find(a => String(a.id) === String(id))).filter(Boolean)
    : artworks.filter(a => !featured || a.id !== featured?.id).slice(0, 3)

  return (
    <>
      {/* HERO */}
      <section style={{display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:'calc(100vh - 80px)', paddingTop:80}}>
        <div style={{display:'flex', flexDirection:'column', justifyContent:'center', padding:'80px 64px 80px 48px'}}>
          <p style={{fontSize:11, fontWeight:500, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--blue)', marginBottom:24}}>
            {settings.heroEyebrow}
          </p>
          <h1 style={{fontFamily:"'Cormorant Garant', serif", fontSize:'clamp(52px, 6vw, 80px)', fontWeight:300, lineHeight:1.08, marginBottom:28}}>
            {settings.heroLine1}<br/>
            <em style={{fontStyle:'italic', color:'var(--gold)'}}>{settings.heroLine2}</em>
          </h1>
          <p style={{fontSize:15, color:'var(--stone)', lineHeight:1.8, maxWidth:380, marginBottom:48}}>
            {settings.heroDesc}
          </p>
          <Link href="/galerie" style={{
            display:'inline-block', padding:'14px 36px',
            background:'var(--gold)', color:'#e9e5da',
            fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase'
          }}>
            {settings.heroBtn}
          </Link>
        </div>

        <div style={{position:'relative', background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          {featured?.image_url ? (
            <div style={{position:'relative', width:'100%', height:'100%', minHeight:600}}>
              <Image src={featured.image_url} alt={featured.title} fill style={{objectFit:'cover'}} />
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:12, opacity:0.4}}>
              <span style={{fontSize:48}}>🎨</span>
              <span style={{fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--stone)'}}>Œuvre à la une</span>
            </div>
          )}
        </div>
      </section>

      {/* RECENT WORKS */}
      <section style={{padding:'80px 48px', background:'var(--cream)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:48}}>
          <h2 style={{fontFamily:"'Cormorant Garant', serif", fontSize:36, fontWeight:300}}>Œuvres récentes</h2>
          <Link href="/galerie" style={{fontSize:11, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--stone)'}}>
            Voir toute la galerie →
          </Link>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:32}}>
          {recent.map(a => <ArtworkCard key={a.id} artwork={a} />)}
        </div>
      </section>

      {/* ABOUT */}
      <section style={{
        background:'#dedad3', borderTop:'2px solid var(--gold)', borderBottom:'2px solid var(--gold)',
        padding:'80px 48px', display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:80, alignItems:'center'
      }}>
        <h2 style={{fontFamily:"'Cormorant Garant', serif", fontSize:44, fontWeight:300, lineHeight:1.1}}>
          {settings.aboutLine1}<br/>& <em style={{fontStyle:'italic', color:'var(--gold)'}}>{settings.aboutLine2}</em>
        </h2>
        <p style={{fontSize:15, lineHeight:1.8, color:'var(--stone)'}}>
          {settings.aboutText}
        </p>
      </section>

      {/* FOOTER */}
      <footer style={{
        background:'#d4d0c7', borderTop:'1px solid rgba(197,110,74,0.2)',
        color:'rgba(42,37,32,0.5)', padding:'40px 48px',
        display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12
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
    </>
  )
}
