'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

// Titre dynamique pour la page À propos
const PAGE_TITLE = 'Clara — À propos · Calar.Artiste'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Footer from '@/components/Footer'

const DEFAULTS = {
  aboutPageTitle:      'Clara',
  aboutPageSubtitle:   'Infirmière & Artiste',
  aboutPageIntro:      "Clara est une artiste passionnée. Son art intuitif et abstrait puise dans les émotions et la beauté de la nature.",
  aboutPageDemarche:   "Chaque toile naît d'une émotion, d'un moment suspendu, d'une couleur aperçue dans la lumière du matin. Ses œuvres aux formes organiques et aux couleurs vives sont une invitation à ressentir, à lâcher prise, à se reconnecter à l'essentiel.",
  aboutPageCitation:   "\"Mon art vous fait voyager entre émotion, nature et émotions.\"",
  aboutPagePhoto:      '',
}

export default function AProposPage() {
  const [s, setS] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = PAGE_TITLE
    supabase.from('settings').select('key, value')
      .then(({ data }) => {
        if (data) {
          const obj = { ...DEFAULTS }
          data.forEach(r => { if (r.key in obj) obj[r.key] = r.value })
          setS(obj)
        }
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div style={{paddingTop:120, textAlign:'center', color:'var(--stone)'}}>Chargement…</div>
  )

  return (
    <>
      <div style={{paddingTop:80}}>

        {/* HERO */}
        <section style={{
          display:'grid', gridTemplateColumns:'1fr 1fr',
          minHeight:'70vh', background:'var(--cream)'
        }}>
          <div style={{display:'flex', flexDirection:'column', justifyContent:'center', padding:'80px 64px 80px 48px'}}>
            <p style={{fontSize:11, fontWeight:500, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--blue)', marginBottom:20}}>
              À propos
            </p>
            <h1 style={{fontFamily:"'Cormorant Garant', serif", fontSize:'clamp(52px, 6vw, 80px)', fontWeight:300, lineHeight:1.08, marginBottom:16, color:'var(--black)'}}>
              {s.aboutPageTitle}
            </h1>
            <p style={{fontSize:16, fontWeight:400, color:'var(--gold)', letterSpacing:'0.06em', marginBottom:32, fontFamily:"'Cormorant Garant', serif", fontStyle:'italic'}}>
              {s.aboutPageSubtitle}
            </p>
            <p style={{fontSize:15, color:'var(--stone)', lineHeight:1.85, maxWidth:420}}>
              {s.aboutPageIntro}
            </p>
          </div>

          <div style={{position:'relative', background:'var(--light)', overflow:'hidden', minHeight:400}}>
            {s.aboutPagePhoto ? (
              <Image src={s.aboutPagePhoto} alt={s.aboutPageTitle} fill style={{objectFit:'cover'}} unoptimized/>
            ) : (
              <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, opacity:0.3}}>
                <span style={{fontSize:64}}>🎨</span>
                <span style={{fontSize:12, color:'var(--stone)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Photo de l'artiste</span>
              </div>
            )}
          </div>
        </section>

        {/* CITATION */}
        {s.aboutPageCitation && (
          <section style={{
            background:'var(--gold)', padding:'60px 48px', textAlign:'center'
          }}>
            <blockquote style={{
              fontFamily:"'Cormorant Garant', serif", fontSize:'clamp(24px, 3vw, 36px)',
              fontWeight:300, fontStyle:'italic', color:'#e9e5da',
              maxWidth:700, margin:'0 auto', lineHeight:1.4
            }}>
              {s.aboutPageCitation}
            </blockquote>
          </section>
        )}

        {/* DÉMARCHE */}
        <section style={{
          padding:'80px 48px', display:'grid',
          gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center',
          background:'var(--cream)'
        }}>
          <h2 style={{fontFamily:"'Cormorant Garant', serif", fontSize:44, fontWeight:300, lineHeight:1.1, color:'var(--black)'}}>
            Ma démarche<br/><em style={{fontStyle:'italic', color:'var(--gold)'}}>artistique</em>
          </h2>
          <p style={{fontSize:15, color:'var(--stone)', lineHeight:1.9}}>
            {s.aboutPageDemarche}
          </p>
        </section>

        {/* CTA */}
        <section style={{
          background:'var(--light)', padding:'80px 48px', textAlign:'center',
          borderTop:'2px solid var(--gold)'
        }}>
          <h2 style={{fontFamily:"'Cormorant Garant', serif", fontSize:36, fontWeight:300, marginBottom:24, color:'var(--black)'}}>
            Découvrez mes œuvres
          </h2>
          <Link href="/galerie" style={{
            display:'inline-block', padding:'14px 48px',
            background:'var(--gold)', color:'#e9e5da',
            fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase'
          }}>
            Voir la galerie
          </Link>
        </section>

      </div>
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          section[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
