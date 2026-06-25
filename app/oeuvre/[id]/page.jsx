'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import ContactModal from '@/components/ContactModal'
import Footer from '@/components/Footer'

export default function OeuvrePage() {
  const { id } = useParams()
  const router = useRouter()
  const [artwork, setArtwork] = useState(null)
  const [contactOpen, setContactOpen] = useState(false)

  useEffect(() => {
    supabase.from('artworks').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) router.push('/galerie')
        else setArtwork(data)
      })
  }, [id])

  if (!artwork) return (
    <div style={{paddingTop:120, textAlign:'center', color:'var(--stone)'}}>Chargement…</div>
  )

  const vendu = artwork.availability === 'Vendu'

  return (
    <>
      <div style={{paddingTop:80}}>
        <button onClick={() => router.back()} style={{
          margin:'28px 48px 0', fontSize:11, fontWeight:500, letterSpacing:'0.1em',
          textTransform:'uppercase', color:'var(--stone)', background:'none', border:'none',
          cursor:'pointer', display:'flex', alignItems:'center', gap:8
        }}>← Retour à la galerie</button>

        <div style={{
          display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:80,
          padding:'48px 48px 80px', alignItems:'start'
        }}>
          {/* Image */}
          <div style={{position:'sticky', top:100}}>
            <div style={{position:'relative', aspectRatio:'3/4', background:'var(--light)', overflow:'hidden'}}>
              {artwork.image_url
                ? <Image src={artwork.image_url} alt={artwork.title} fill style={{objectFit:'cover'}} sizes="50vw"/>
                : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:64,opacity:0.15}}>🖼️</div>
              }
            </div>
          </div>

          {/* Info */}
          <div style={{paddingTop:16}}>
            <p style={{fontSize:11, fontWeight:500, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--blue)', marginBottom:16}}>
              {artwork.category}
            </p>
            <h1 style={{fontFamily:"'Cormorant Garant', serif", fontSize:52, fontWeight:300, lineHeight:1.05, marginBottom:8}}>
              {artwork.title}
            </h1>
            <p style={{fontSize:14, color:'var(--stone)', marginBottom:32}}>{artwork.year}</p>
            <hr style={{border:'none', borderTop:'1px solid rgba(197,110,74,0.2)', margin:'32px 0'}}/>
            <p style={{fontSize:15, lineHeight:1.85, color:'var(--stone)'}}>
              {artwork.description || 'Pas de description disponible.'}
            </p>
            <div style={{marginTop:40, display:'grid', gap:16}}>
              {[
                ['Technique', artwork.technique],
                ['Dimensions', artwork.dimensions],
                ['Disponibilité', artwork.availability]
              ].map(([label, val]) => val && (
                <div key={label} style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:12}}>
                  <span style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--stone)'}}>{label}</span>
                  <span style={{fontSize:14, fontWeight:500}}>{val}</span>
                </div>
              ))}
            </div>
            {artwork.price && (
              <p style={{marginTop:40, fontFamily:"'Cormorant Garant', serif", fontSize:36, color:'var(--gold)'}}>
                {Number(artwork.price).toLocaleString('fr-FR')} €
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
              {vendu ? 'Œuvre vendue' : 'Me contacter'}
            </button>
          </div>
        </div>
      </div>

      <Footer />

      {contactOpen && (
        <ContactModal artwork={artwork} onClose={() => setContactOpen(false)} />
      )}
    </>
  )
}
