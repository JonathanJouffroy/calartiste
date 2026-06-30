'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/lib/LangContext'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const pathname = usePathname()
  const { lang, setLang, t } = useLang()

  useEffect(() => {
    setIsAdmin(!!sessionStorage.getItem('calar_admin'))
  }, [pathname])

  const close = () => { setMenuOpen(false); document.body.style.overflow = '' }
  const toggle = () => {
    setMenuOpen(o => {
      document.body.style.overflow = !o ? 'hidden' : ''
      return !o
    })
  }

  const logout = () => {
    sessionStorage.removeItem('calar_admin')
    setIsAdmin(false)
    close()
    window.location.href = '/'
  }

  const switchLang = (newLang) => {
    setLang(newLang)
    setLangOpen(false)
  }

  const LangDropdown = ({ mobile }) => (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setLangOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: mobile ? 14 : 12, fontWeight: 600, letterSpacing: '0.08em',
          color: mobile ? 'var(--black)' : 'var(--stone)',
          background: 'none', border: mobile ? '1px solid rgba(197,110,74,0.3)' : 'none',
          padding: mobile ? '8px 16px' : 0, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        {lang.toUpperCase()} <span style={{ fontSize: 9 }}>▾</span>
      </button>
      {langOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          background: 'var(--cream)', border: '1px solid rgba(197,110,74,0.2)',
          minWidth: 110, zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}>
          {[['fr', 'Français'], ['en', 'English']].map(([code, label]) => (
            <button
              key={code}
              onClick={() => switchLang(code)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 16px', fontSize: 12, fontWeight: 500,
                color: lang === code ? 'var(--gold)' : 'var(--stone)',
                background: lang === code ? 'rgba(197,110,74,0.06)' : 'transparent',
                border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif'
              }}
            >{label}</button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <>
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'20px 48px',
        background:'rgba(233,229,218,0.95)',
        backdropFilter:'blur(8px)',
        borderBottom:'1px solid rgba(197,110,74,0.15)'
      }}>
        <Link href="/" onClick={close} style={{
          fontFamily:"'Cormorant Garant', serif",
          fontSize:22, fontWeight:400, letterSpacing:'0.08em', color:'var(--gold)'
        }}>
          Calar.Artiste
        </Link>

        {/* Desktop links */}
        <div style={{ display:'flex', alignItems:'center', gap:36 }} className="nav-desktop-links">
          <ul style={{display:'flex', gap:36, listStyle:'none'}}>
            {[
              { href:'/', label: t('nav.home') },
              { href:'/galerie', label: t('nav.gallery') },
              { href:'/a-propos', label: t('nav.about') },
            ].map(({href, label}) => (
              <li key={href}>
                <Link href={href} style={{
                  fontSize:12, fontWeight:500, letterSpacing:'0.12em',
                  textTransform:'uppercase',
                  color: pathname === href ? 'var(--gold)' : 'var(--stone)'
                }}>{label}</Link>
              </li>
            ))}
            {isAdmin && <>
              <li><Link href="/admin" style={{fontSize:12,fontWeight:500,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--stone)'}}>{t('nav.admin')}</Link></li>
              <li><button onClick={logout} style={{fontSize:12,fontWeight:500,letterSpacing:'0.12em',textTransform:'uppercase',color:'#c00',background:'none',border:'none',cursor:'pointer'}}>{t('nav.logout')}</button></li>
            </>}
          </ul>
          <LangDropdown />
        </div>

        {/* Burger */}
        <button onClick={toggle} aria-label="Menu" className="burger-btn" style={{
          display:'none', flexDirection:'column', justifyContent:'center',
          gap:5, width:36, height:36, background:'none', border:'none', cursor:'pointer', padding:4,
        }}>
          <span className={`burger-line ${menuOpen ? 'open-1' : ''}`}/>
          <span className={`burger-line ${menuOpen ? 'open-2' : ''}`}/>
          <span className={`burger-line ${menuOpen ? 'open-3' : ''}`}/>
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link href="/" onClick={close} className={pathname==='/'?'active':''}>{t('nav.home')}</Link>
        <Link href="/galerie" onClick={close} className={pathname==='/galerie'?'active':''}>{t('nav.gallery')}</Link>
        <Link href="/a-propos" onClick={close} className={pathname==='/a-propos'?'active':''}>{t('nav.about')}</Link>
        {isAdmin && <>
          <Link href="/admin" onClick={close}>{t('nav.admin')}</Link>
          <button onClick={logout} className="mobile-logout">{t('nav.logout')}</button>
        </>}
        <div style={{ marginTop: 8 }}>
          <LangDropdown mobile />
        </div>
      </div>

      <style jsx global>{`
        .burger-btn { display: none; }
        .burger-line {
          display: block; height: 2px; width: 100%;
          background: var(--black); border-radius: 2px;
          transition: transform 0.3s, opacity 0.3s;
        }
        .open-1 { transform: translateY(7px) rotate(45deg); }
        .open-2 { opacity: 0; }
        .open-3 { transform: translateY(-7px) rotate(-45deg); }
        .mobile-menu {
          display: none; position: fixed; inset: 0; z-index: 99;
          background: var(--cream);
          flex-direction: column; align-items: center; justify-content: center;
          gap: 32px;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu a, .mobile-menu button.mobile-logout {
          font-family: 'Cormorant Garant', serif;
          font-size: 36px; font-weight: 300;
          color: var(--black); text-decoration: none;
          letter-spacing: 0.04em; cursor: pointer;
          transition: color 0.2s; background: none; border: none;
        }
        .mobile-menu a:hover, .mobile-menu a.active { color: var(--gold); }
        .mobile-menu .mobile-logout {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase; color: #c00;
        }
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .burger-btn { display: flex !important; }
          nav { padding: 16px 20px !important; }
        }
      `}</style>
    </>
  )
}
