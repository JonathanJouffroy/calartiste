'use client'
import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { useLang } from '@/lib/LangContext'

export default function ContactModal({ artwork, onClose }) {
  const { t } = useLang()
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const send = async (e) => {
    e.preventDefault()
    setSending(true); setError('')
    try {
      emailjs.init({ publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY })
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        {
          to_email:       'calar.artiste@gmail.com',
          from_firstname: e.target.firstname.value,
          from_lastname:  e.target.lastname.value,
          from_email:     e.target.email.value,
          artwork_title:  artwork.title,
          artwork_year:   artwork.year,
          message:        e.target.message.value || '(pas de message)',
          reply_to:       e.target.email.value,
        }
      )
      setSent(true)
    } catch (err) {
      setError(t('contact.error'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(7,5,2,0.75)', backdropFilter:'blur(6px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:16
    }}>
      <div onClick={e => e.stopPropagation()} className="contact-modal-box" style={{
        background:'var(--cream)', padding:'52px 44px',
        width:'100%', maxWidth:460, position:'relative',
        boxShadow:'0 40px 80px rgba(0,0,0,0.25)',
        border:'1px solid rgba(197,110,74,0.2)',
        maxHeight:'90vh', overflowY:'auto'
      }}>
        <button onClick={onClose} style={{
          position:'absolute', top:18, right:20, background:'none',
          border:'none', fontSize:20, cursor:'pointer', color:'var(--stone)'
        }}>✕</button>

        {sent ? (
          <div style={{textAlign:'center', padding:'20px 0'}}>
            <div style={{fontSize:40, marginBottom:12}}>✉️</div>
            <h2 style={{fontFamily:"'Cormorant Garant', serif", fontSize:24, fontWeight:300, marginBottom:8}}>{t('contact.sent')}</h2>
            <p style={{fontSize:13, color:'var(--stone)', lineHeight:1.7}}>{t('contact.sentDesc')}<br/>{t('contact.sentDesc2')}</p>
          </div>
        ) : (
          <>
            <p style={{fontSize:10, fontWeight:500, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--blue)', marginBottom:10}}>Calar.Artiste</p>
            <h2 style={{fontFamily:"'Cormorant Garant', serif", fontSize:30, fontWeight:300, marginBottom:6}}>{t('contact.title')}</h2>
            <p style={{fontSize:12, color:'var(--stone)', marginBottom:28, fontStyle:'italic'}}>{t('contact.about')} {artwork.title} ({artwork.year})</p>

            {error && <div style={{fontSize:12, color:'#c44', padding:'10px 14px', background:'rgba(196,49,43,0.08)', border:'1px solid rgba(196,49,43,0.2)', marginBottom:16}}>{error}</div>}

            <form onSubmit={send} style={{display:'grid', gap:18}}>
              <div className="contact-form-row" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
                <div style={{display:'grid', gap:8}}>
                  <label style={{fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--stone)'}}>{t('contact.firstname')} *</label>
                  <input name="firstname" required placeholder="Marie" style={inputStyle}/>
                </div>
                <div style={{display:'grid', gap:8}}>
                  <label style={{fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--stone)'}}>{t('contact.lastname')}</label>
                  <input name="lastname" placeholder="Dupont" style={inputStyle}/>
                </div>
              </div>
              <div style={{display:'grid', gap:8}}>
                <label style={{fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--stone)'}}>{t('contact.email')} *</label>
                <input name="email" type="email" required placeholder="marie@exemple.fr" style={inputStyle}/>
              </div>
              <div style={{display:'grid', gap:8}}>
                <label style={{fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--stone)'}}>{t('contact.message')}</label>
                <textarea name="message" rows={4} style={{...inputStyle, resize:'vertical'}}/>
              </div>
              <button type="submit" disabled={sending} style={{
                padding:'14px 40px', background:'var(--gold)', color:'#e9e5da',
                border:'none', cursor:'pointer', fontSize:11, fontWeight:600,
                letterSpacing:'0.14em', textTransform:'uppercase', width:'100%'
              }}>
                {sending ? t('contact.sending') : t('contact.send')}
              </button>
            </form>
          </>
        )}
      </div>
      <style jsx>{`
        @media (max-width: 480px) {
          .contact-modal-box { padding: 40px 24px !important; }
          .contact-form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

const inputStyle = {
  border:'1px solid rgba(197,110,74,0.2)', padding:'11px 12px',
  fontSize:14, fontFamily:'Inter, sans-serif',
  background:'var(--light)', color:'var(--black)',
  outline:'none', width:'100%'
}
