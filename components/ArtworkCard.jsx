'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '@/lib/LangContext'

export default function ArtworkCard({ artwork: a }) {
  const { lang, t } = useLang()
  const imageUrl = a.image_url
    ? `${a.image_url}?t=${a.updated_at || a.created_at || Date.now()}`
    : null

  const title = lang === 'en' && a.title_en ? a.title_en : a.title
  const category = lang === 'en' && a.category_en ? a.category_en : a.category
  const availability = lang === 'en' ? t(`availability.${a.availability}`) : a.availability

  return (
    <Link href={`/oeuvre/${a.id}`} style={{display:'block', cursor:'pointer', textDecoration:'none'}}>
      <div style={{
        background:'var(--light)', transition:'transform 0.3s, box-shadow 0.3s',
        position:'relative'
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(197,110,74,0.2)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
      >
        <div style={{position:'relative', aspectRatio:'3/4', overflow:'hidden', background:'var(--light)'}}>
          {imageUrl
            ? <Image key={imageUrl} src={imageUrl} alt={title} fill style={{objectFit:'cover'}} sizes="(max-width:768px) 50vw, 30vw" unoptimized/>
            : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,opacity:0.2}}>🖼️</div>
          }
          <div style={{
            position:'absolute', inset:0, background:'rgba(197,110,74,0)',
            display:'flex', alignItems:'flex-end', padding:24,
            transition:'background 0.3s', opacity:0
          }}
            className="card-overlay"
          >
            <span style={{fontSize:11,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'#2A2520'}}>{t('gallery.viewArtwork')}</span>
          </div>
        </div>
        <div style={{padding:'16px 0 4px'}}>
          <div style={{fontFamily:"'Cormorant Garant', serif", fontSize:20, fontWeight:400, color:'var(--black)'}}>{title}</div>
          <div style={{fontSize:12, color:'var(--stone)', marginTop:4}}>{category || ''} · {a.year}</div>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8}}>
            {a.price
              ? <div style={{fontSize:13, color:'var(--gold)', fontWeight:500}}>{Number(a.price).toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR')} €</div>
              : <div/>
            }
            {a.availability && (
              <span style={{
                fontSize:10, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase',
                padding:'3px 8px',
                background: a.availability === 'Disponible' ? 'rgba(96,111,82,0.12)' : a.availability === 'Vendu' ? 'rgba(196,49,43,0.1)' : 'rgba(197,110,74,0.1)',
                color: a.availability === 'Disponible' ? 'var(--blue)' : a.availability === 'Vendu' ? 'var(--red)' : 'var(--gold)'
              }}>{availability}</span>
            )}
          </div>
        </div>
      </div>
      <style jsx global>{`
        a:hover .card-overlay { background: rgba(197,110,74,0.75) !important; opacity: 1 !important; }
      `}</style>
    </Link>
  )
}
