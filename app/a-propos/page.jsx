'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Footer from '@/components/Footer'
import emailjs from '@emailjs/browser'

// Titre dynamique pour la page À propos
const PAGE_TITLE = 'Clara — À propos · Calar.Artiste'

const DEFAULTS = {
  aboutPageTitle:      'Clara',
  aboutPageSubtitle:   'Artiste',
  aboutPageIntro:      "Clara est une artiste passionnée. Son art intuitif et abstrait puise dans les émotions et la beauté de la nature.",
  aboutPageDemarche:   "Chaque toile naît d'une émotion, d'un moment suspendu, d'une couleur aperçue dans la lumière du matin. Ses œuvres aux formes organiques et aux couleurs vives sont une invitation à ressentir, à lâcher prise, à se reconnecter à l'essentiel.",
  aboutPageCitation:   "\"Mon art vous fait voyager entre émotion et nature.\"",
  aboutPagePhoto:      '',
}

const inputStyle = {
  border:'1px solid rgba(197,110,74,0.2)', padding:'11px 14px',
  fontSize:14, fontFamily:'Inter, sans-serif',
  background:'var(--cream)', color:'var(--black)',
  outline:'none', width:'100%', boxSizing:'border-box',
  transition:'border-color 0.2s'
}

export default function AProposPage() {
  const [s, setS] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ firstname:'', lastname:'', email:'', subject:'', message:'' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

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
        // Scroll vers l'ancre #contact après chargement
        if (window.location.hash === '#contact') {
          setTimeout(() => {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        }
      })
  }, [])

  const sendContact = async (e) => {
    e.preventDefault()
    setSending(true); setError('')
    try {
      emailjs.init({ publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY })
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        {
          to_email:       'calar.artiste@gmail.com',
          from_firstname: form.firstname,
          from_lastname:  form.lastname,
          from_email:     form.email,
          artwork_title:  form.subject || 'Commande personnalisée',
          artwork_year:   '',
          message:        form.message,
          reply_to:       form.email,
        }
      )
      setSent(true)
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer ou contacter Clara directement.')
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div style={{paddingTop:120, textAlign:'center', color:'var(--stone)'}}>Chargement…</div>
  )

  return (
    <>
      <div style={{paddingTop:80}}>

        {/* HERO */}
        <section className="about-hero" style={{
          display:'grid', gridTemplateColumns:'1fr 1fr',
          minHeight:'70vh', background:'var(--cream)'
        }}>
          <div className="about-hero-text" style={{display:'flex', flexDirection:'column', justifyContent:'center', padding:'80px 64px 80px 48px'}}>
            <p style={{fontSize:11, fontWeight:500, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--blue)', marginBottom:20}}>
              À propos
            </p>
            <h1 style={{fontFamily:"'Cormorant Garant', serif", fontSize:'clamp(38px, 9vw, 80px)', fontWeight:300, lineHeight:1.08, marginBottom:16, color:'var(--black)'}}>
              {s.aboutPageTitle}
            </h1>
            <p style={{fontSize:16, fontWeight:400, color:'var(--gold)', letterSpacing:'0.06em', marginBottom:32, fontFamily:"'Cormorant Garant', serif", fontStyle:'italic'}}>
              {s.aboutPageSubtitle}
            </p>
            <p style={{fontSize:15, color:'var(--stone)', lineHeight:1.85, maxWidth:420, whiteSpace:'pre-wrap'}}>
              {s.aboutPageIntro}
            </p>
          </div>

          <div className="about-hero-photo" style={{position:'relative', background:'var(--light)', overflow:'hidden', minHeight:400}}>
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
          <section className="about-citation" style={{
            background:'var(--gold)', padding:'60px 48px', textAlign:'center'
          }}>
            <blockquote style={{
              fontFamily:"'Cormorant Garant', serif", fontSize:'clamp(24px, 3vw, 36px)',
              fontWeight:300, fontStyle:'italic', color:'#e9e5da',
              maxWidth:700, margin:'0 auto', lineHeight:1.4, whiteSpace:'pre-wrap'
            }}>
              {s.aboutPageCitation}
            </blockquote>
          </section>
        )}

        {/* DÉMARCHE */}
        <section className="about-demarche" style={{
          padding:'80px 48px', display:'grid',
          gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center',
          background:'var(--cream)'
        }}>
          <h2 style={{fontFamily:"'Cormorant Garant', serif", fontSize:'clamp(28px, 6vw, 44px)', fontWeight:300, lineHeight:1.1, color:'var(--black)'}}>
            Ma démarche<br/><em style={{fontStyle:'italic', color:'var(--gold)'}}>artistique</em>
          </h2>
          <p style={{fontSize:15, color:'var(--stone)', lineHeight:1.9, whiteSpace:'pre-wrap'}}>
            {s.aboutPageDemarche}
          </p>
        </section>

        {/* FORMULAIRE DE CONTACT */}
        <section id="contact" className="about-contact" style={{
          background:'var(--light)', padding:'80px 48px',
          borderTop:'2px solid var(--gold)'
        }}>
          <div style={{maxWidth:640, margin:'0 auto'}}>
            <p style={{fontSize:11, fontWeight:500, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--gold)', marginBottom:16, textAlign:'center'}}>
              Commande personnalisée
            </p>
            <h2 style={{fontFamily:"'Cormorant Garant', serif", fontSize:'clamp(28px, 6vw, 44px)', fontWeight:300, marginBottom:12, color:'var(--black)', textAlign:'center', lineHeight:1.1}}>
              Une idée en tête ?<br/><em style={{fontStyle:'italic', color:'var(--gold)'}}>Parlons-en</em>
            </h2>
            <p style={{fontSize:15, color:'var(--stone)', textAlign:'center', lineHeight:1.8, marginBottom:48}}>
              Décrivez votre projet — couleurs, dimensions, émotion souhaitée — et Clara vous répondra pour co-créer votre œuvre unique.
            </p>

            {sent ? (
              <div style={{textAlign:'center', padding:'40px 0'}}>
                <div style={{fontSize:48, marginBottom:16}}>✉️</div>
                <h3 style={{fontFamily:"'Cormorant Garant', serif", fontSize:28, fontWeight:300, color:'var(--black)', marginBottom:8}}>
                  Message envoyé !
                </h3>
                <p style={{fontSize:14, color:'var(--stone)', lineHeight:1.7}}>
                  Merci pour votre demande.<br/>Clara vous répondra dans les plus brefs délais.
                </p>
                <button onClick={() => { setSent(false); setForm({ firstname:'', lastname:'', email:'', subject:'', message:'' }) }}
                  style={{marginTop:24, fontSize:11, color:'var(--gold)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline', letterSpacing:'0.08em', textTransform:'uppercase'}}>
                  Envoyer une autre demande
                </button>
              </div>
            ) : (
              <form onSubmit={sendContact} style={{display:'grid', gap:20}}>
                {error && (
                  <div style={{fontSize:13, color:'#c44', padding:'12px 16px', background:'rgba(196,49,43,0.08)', border:'1px solid rgba(196,49,43,0.2)'}}>
                    {error}
                  </div>
                )}
                <div className="about-form-row" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
                  <div style={{display:'grid', gap:8}}>
                    <label style={{fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--stone)'}}>Prénom *</label>
                    <input required value={form.firstname} onChange={e => setForm(f => ({...f, firstname:e.target.value}))} placeholder="Marie" style={inputStyle}/>
                  </div>
                  <div style={{display:'grid', gap:8}}>
                    <label style={{fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--stone)'}}>Nom</label>
                    <input value={form.lastname} onChange={e => setForm(f => ({...f, lastname:e.target.value}))} placeholder="Dupont" style={inputStyle}/>
                  </div>
                </div>
                <div style={{display:'grid', gap:8}}>
                  <label style={{fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--stone)'}}>Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email:e.target.value}))} placeholder="marie@exemple.fr" style={inputStyle}/>
                </div>
                <div style={{display:'grid', gap:8}}>
                  <label style={{fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--stone)'}}>Sujet</label>
                  <input value={form.subject} onChange={e => setForm(f => ({...f, subject:e.target.value}))} placeholder="Ex : Portrait, paysage abstrait, cadeau…" style={inputStyle}/>
                </div>
                <div style={{display:'grid', gap:8}}>
                  <label style={{fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--stone)'}}>Votre projet *</label>
                  <textarea required value={form.message} onChange={e => setForm(f => ({...f, message:e.target.value}))} rows={5}
                    placeholder="Décrivez votre projet : couleurs souhaitées, dimensions, destination de l'œuvre, émotion recherchée…"
                    style={{...inputStyle, resize:'vertical'}}/>
                </div>
                <button type="submit" disabled={sending} style={{
                  padding:'15px', background:'var(--gold)', color:'var(--cream)',
                  border:'none', cursor: sending ? 'not-allowed' : 'pointer',
                  fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase',
                  opacity: sending ? 0.7 : 1, transition:'all 0.2s'
                }}>
                  {sending ? 'Envoi en cours…' : 'Envoyer ma demande'}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* CTA GALERIE */}
        <section className="about-cta" style={{
          background:'var(--cream)', padding:'60px 48px', textAlign:'center',
        }}>
          <h2 style={{fontFamily:"'Cormorant Garant', serif", fontSize:32, fontWeight:300, marginBottom:20, color:'var(--black)'}}>
            Découvrez mes œuvres
          </h2>
          <Link href="/galerie" style={{
            display:'inline-block', padding:'14px 48px',
            background:'var(--black)', color:'#e9e5da',
            fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase'
          }}>
            Voir la galerie
          </Link>
        </section>

      </div>
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .about-hero { grid-template-columns: 1fr !important; min-height: auto !important; }
          .about-hero-text { padding: 56px 20px 40px !important; }
          .about-hero-photo { min-height: 320px !important; }
          .about-citation { padding: 40px 20px !important; }
          .about-demarche { grid-template-columns: 1fr !important; gap: 32px !important; padding: 48px 20px !important; }
          .about-contact { padding: 48px 20px !important; }
          .about-form-row { grid-template-columns: 1fr !important; }
          .about-cta { padding: 40px 20px !important; }
        }
      `}</style>
    </>
  )
}
