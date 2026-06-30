'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import ContactModal from '@/components/ContactModal'
import Footer from '@/components/Footer'
import { useLang } from '@/lib/LangContext'

export default function OeuvrePage() {
  const { id } = useParams()
  const router = useRouter()
  const { lang, t } = useLang()
  const [artwork, setArtwork] = useState(null)
  const [contactOpen, setContactOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    supabase.from('artworks').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) router.push('/galerie')
        else setArtwork(data)
      })
  }, [id])

  useEffect(() => {
    if (artwork) {
      const title = lang === 'en' && artwork.title_en ? artwork.title_en : artwork.title
      document.title = `${title} · Calar.Artiste`
    }
  }, [artwork, lang])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setLightboxOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  if (!artwork) return (
    <div style={{paddingTop:120, textAlign:'center', color:'var(--stone)'}}>{t('pdp.loading')}</div>
  )

  const vendu = artwork.availability === 'Vendu'
  const title = lang === 'en' && artwork.title_en ? artwork.title_en : artwork.title
  const category = lang === 'en' && artwork.category_en ? artwork.category_en : artwork.category
  const description = lang === 'en' && artwork.description_en ? artwork.description_en : artwork.description
  const technique = lang === 'en' && artwork.technique_en ? artwork.technique_en : artwork.technique
  const dimensions = lang === 'en' && artwork.dimensions_en ? artwork.dimensions_en : artwork.dimensions
  const duration = lang === 'en' && artwork.duration_en ? artwork.duration_en : artwork.duration
  const availability = lang === 'en' ? t(`availability.${artwork.availability}`) : artwork.availability

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: title,
    description: description,
    image: artwork.image_url,
    dateCreated: artwork.year,
    artMedium: technique,
    artworkSurface: 'Toile',
    width: dimensions,
    offers: artwork.price && artwork.availability === 'Disponible' ? {
      '@type': 'Offer',
      price: artwork.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock'
    } : undefined,
    creator: {
      '@type': 'Person',
      name: 'Clara',
      alternateName: 'Calar.Artiste',
      sameAs: 'https://www.instagram.com/calar.artiste'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
      />

      <div style={{paddingTop:80}}>
        <button onClick={() => router.push('/galerie')} className="pdp-back" style={{
          margin:'28px 48px 0', fontSize:11, fontWeight:500, letterSpacing:'0.1em',
          textTransform:'uppercase', color:'var(--stone)', background:'none', border:'none',
          cursor:'pointer', display:'flex', alignItems:'center', gap:8
        }}>{t('pdp.back')}</button>

        <div className="pdp-layout" style={{
          display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:80,
          padding:'48px 48px 80px', alignItems:'start'
        }}>
          <div className="pdp-image-wrap" style={{position:'sticky', top:100}}>
            <div
              onClick={() => artwork.image_url && setLightboxOpen(true)}
              style={{
                position:'relative', aspectRatio:'3/4', background:'var(--light)',
                overflow:'hidden', cursor: artwork.image_url ? 'zoom-in' : 'default'
              }}
            >
              {artwork.image_url
                ? <Image src={artwork.image_url} alt={`${title} — Calar.Artiste`} fill style={{objectFit:'cover'}} sizes="50vw" unoptimized/>
                : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:64,opacity:0.15}}>🖼️</div>
              }
              {artwork.image_url && (
                <div style={{
                  position:'absolute', bottom:12, right:12,
                  background:'rgba(42,37,32,0.6)', color:'#fff',
                  fontSize:10, fontWeight:500, letterSpacing:'0.1em',
                  textTransform:'uppercase', padding:'6px 10px',
                  backdropFilter:'blur(4px)'
                }}>{t('pdp.enlarge')}</div>
              )}
            </div>
          </div>

          <div style={{paddingTop:16}}>
            <p style={{fontSize:11, fontWeight:500, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--blue)', marginBottom:16}}>
              {category}
            </p>
            <h1 style={{fontFamily:"'Cormorant Garant', serif", fontSize:'clamp(34px, 7vw, 52px)', fontWeight:300, lineHeight:1.05, marginBottom:8}}>
              {title}
            </h1>
            <p style={{fontSize:14, color:'var(--stone)', marginBottom:32}}>{artwork.year}</p>
            <hr style={{border:'none', borderTop:'1px solid rgba(197,110,74,0.2)', margin:'32px 0'}}/>
            <p style={{fontSize:15, lineHeight:1.85, color:'var(--stone)', whiteSpace:'pre-wrap'}}>
              {description || t('pdp.noDescription')}
            </p>
            <div style={{marginTop:40, display:'grid', gap:16}}>
              {[
                [t('pdp.technique'), technique],
                [t('pdp.dimensions'), dimensions],
                [t('pdp.duration'), duration],
                [t('pdp.availability'), availability]
              ].map(([label, val]) => val && (
                <div key={label} style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid rgba(197,110,74,0.1)', paddingBottom:12}}>
                  <span style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--stone)'}}>{label}</span>
                  <span style={{fontSize:14, fontWeight:500}}>{val}</span>
                </div>
              ))}
            </div>
            {artwork.price && (
              <p style={{marginTop:40, fontFamily:"'Cormorant Garant', serif", fontSize:36, color:'var(--gold)'}}>
                {Number(artwork.price).toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR')} €
              </p>
            )}
            <button
              onClick={() => !vendu && setContactOpen(true)}
              disabled={vendu}
              style={{
                marginTop:24, width:'100%', padding:16,
                background: vendu ? 'var(--stone)' : 'var(--gold)',
                color:'#e9e5da', fontSize:11, fontWeight:600,
                letterSpacing:'0.14em', textTransform:'uppercase',
                border:'none', cursor: vendu ? 'not-allowed' : 'pointer',
                opacity: vendu ? 0.6 : 1
              }}
            >
              {vendu ? t('pdp.sold') : t('pdp.contactMe')}
            </button>
          </div>
        </div>
      </div>

      <Footer />

      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position:'fixed', inset:0, zIndex:300,
            background:'rgba(10,7,3,0.95)',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:24, cursor:'zoom-out'
          }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position:'absolute', top:20, right:24,
              background:'none', border:'none', color:'rgba(255,255,255,0.7)',
              fontSize:28, cursor:'pointer', lineHeight:1
            }}
          >✕</button>

          <div
            onClick={e => e.stopPropagation()}
            style={{display:'flex', flexDirection:'column', alignItems:'center', maxWidth:'90vw', maxHeight:'90vh'}}
          >
            <img
              src={artwork.image_url}
              alt={title}
              style={{maxWidth:'90vw', maxHeight:'75vh', objectFit:'contain', display:'block', boxShadow:'0 40px 80px rgba(0,0,0,0.5)'}}
            />
            <div style={{marginTop:20, textAlign:'center'}}>
              <p style={{fontFamily:"'Cormorant Garant', serif", fontSize:20, fontWeight:300, color:'rgba(255,255,255,0.9)', letterSpacing:'0.04em'}}>
                {title}
                {artwork.year && <span style={{color:'var(--gold)', marginLeft:12}}>· {artwork.year}</span>}
              </p>
              {technique && (
                <p style={{fontSize:11, color:'rgba(255,255,255,0.45)', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:6}}>
                  {technique}{dimensions && ` · ${dimensions}`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {contactOpen && <ContactModal artwork={{...artwork, title}} onClose={() => setContactOpen(false)} />}

      <style>{`
        @media (max-width: 768px) {
          .pdp-layout {
            grid-template-columns: 1fr !important;
            padding: 20px !important;
            gap: 28px !important;
          }
          .pdp-image-wrap { position: static !important; }
          .pdp-back { margin: 20px 20px 0 !important; }
        }
      `}</style>
    </>
  )
}
