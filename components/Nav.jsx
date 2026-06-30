'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()

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
        <ul style={{display:'flex', gap:36, listStyle:'none', '@media(max-width:768px)':{display:'none'}}}>
          {[
            { href:'/', label:'Accueil' },
            { href:'/galerie', label:'Galerie' },
            { href:'/a-propos', label:'À propos' },
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
            <li><Link href="/admin" style={{fontSize:12,fontWeight:500,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--stone)'}}>Admin</Link></li>
            <li><button onClick={logout} style={{fontSize:12,fontWeight:500,letterSpacing:'0.12em',textTransform:'uppercase',color:'#c00',background:'none',border:'none',cursor:'pointer'}}>Déconnexion</button></li>
          </>}
        </ul>

        {/* Burger */}
        <button onClick={toggle} aria-label="Menu" style={{
          display:'none', flexDirection:'column', justifyContent:'center',
          gap:5, width:36, height:36, background:'none', border:'none', cursor:'pointer', padding:4,
          ['@media(max-width:768px)']:{ display:'flex' }
        }} className="burger-btn">
          <span className={`burger-line ${menuOpen ? 'open-1' : ''}`}/>
          <span className={`burger-line ${menuOpen ? 'open-2' : ''}`}/>
          <span className={`burger-line ${menuOpen ? 'open-3' : ''}`}/>
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link href="/" onClick={close} className={pathname==='/'?'active':''}>Accueil</Link>
        <Link href="/galerie" onClick={close} className={pathname==='/galerie'?'active':''}>Galerie</Link>
        <Link href="/a-propos" onClick={close} className={pathname==='/a-propos'?'active':''}>À propos</Link>
        {isAdmin && <>
          <Link href="/admin" onClick={close}>Admin</Link>
          <button onClick={logout} className="mobile-logout">Déconnexion</button>
        </>}
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
          gap: 40px;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu a, .mobile-menu button {
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
          nav ul { display: none !important; }
          .burger-btn { display: flex !important; }
          nav { padding: 16px 20px !important; }
        }
      `}</style>
    </>
  )
}
