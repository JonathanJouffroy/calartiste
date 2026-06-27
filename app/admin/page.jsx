'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const DEFAULT_SETTINGS = {
  heroLine1: "L'art qui fait", heroLine2: 'voyager',
  heroDesc: 'Entre émotion, nature et guérison — chaque toile de Clara est un voyage intérieur peint avec sincérité et énergie.',
  heroBtn: 'Voir les œuvres', heroEyebrow: 'Art intuitif & abstrait',
  aboutLine1: 'Infirmière', aboutLine2: 'artiste',
  aboutText: "Clara est infirmière le jour, artiste en permanence. Son art intuitif et abstrait puise dans les émotions du soin, la beauté de la nature et le chemin vers la guérison.",
  featuredId: '', recentId1: '', recentId2: '', recentId3: '',
  aboutPageTitle: 'Clara', aboutPageSubtitle: 'Infirmière & Artiste',
  aboutPageIntro: "Clara est infirmière le jour, artiste en permanence.",
  aboutPageDemarche: "Chaque toile naît d'une émotion, d'un moment suspendu.",
  aboutPageCitation: '"Mon art vous fait voyager entre émotion, nature et guérison."',
  aboutPagePhoto: '',
}

function authHeaders() {
  const token = sessionStorage.getItem('calar_admin')
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
}

// ─── Composants UI ───
function Section({ title, children }) {
  return (
    <div style={{background:'#2a2520', border:'1px solid rgba(197,110,74,0.1)', borderRadius:2, overflow:'hidden', marginBottom:24}}>
      <div style={{padding:'16px 24px', borderBottom:'1px solid rgba(197,110,74,0.12)', background:'#1a1008'}}>
        <h3 style={{fontFamily:"'Cormorant Garant', serif", fontSize:18, fontWeight:400, color:'#f5f2ed'}}>{title}</h3>
      </div>
      <div style={{padding:24}}>{children}</div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div style={{display:'grid', gap:6, minWidth:0, marginBottom:16}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
        <label style={{fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(245,242,237,0.6)'}}>{label}</label>
        {hint && <span style={{fontSize:11, color:'var(--stone)', opacity:0.7}}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function Row({ children }) {
  return <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>{children}</div>
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState('add')
  const [artworks, setArtworks] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [savedSettings, setSavedSettings] = useState(DEFAULT_SETTINGS)
  const [toast, setToast] = useState({ msg:'', type:'success' })
  const [editId, setEditId] = useState('')
  const [form, setForm] = useState({ title:'', year:'', category:'', desc:'', technique:'', dimensions:'', price:'', availability:'Disponible', duration:'' })
  const [savedForm, setSavedForm] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()
  const photoRef = useRef()

  // Auth check
  useEffect(() => {
    if (!sessionStorage.getItem('calar_admin')) router.push('/admin/login')
  }, [])

  // Confirmation avant de quitter avec modifications non sauvegardées
  const hasUnsavedChanges = useCallback(() => {
    if (tab === 'settings') {
      return JSON.stringify(settings) !== JSON.stringify(savedSettings)
    }
    if (tab === 'add' && savedForm) {
      return JSON.stringify(form) !== JSON.stringify(savedForm)
    }
    return false
  }, [tab, settings, savedSettings, form, savedForm])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges()) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const switchTab = (newTab) => {
    if (hasUnsavedChanges()) {
      if (!confirm('Vous avez des modifications non sauvegardées. Quitter quand même ?')) return
    }
    setTab(newTab)
  }

  const loadArtworks = async () => {
    const res = await fetch('/api/artworks')
    setArtworks(await res.json())
  }

  const loadSettings = async () => {
    const res = await fetch('/api/settings')
    const rows = await res.json()
    const s = { ...DEFAULT_SETTINGS }
    rows.forEach(r => { if (r.key in s) s[r.key] = r.value })
    setSettings(s)
    setSavedSettings(s)
  }

  useEffect(() => { loadArtworks(); loadSettings() }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg:'', type:'success' }), 3500)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setUploadError(''); setImagePreview('')
    if (!file) return
    const MAX = 2 * 1024 * 1024
    const TYPES = ['image/jpeg', 'image/png', 'image/webp']
    if (!TYPES.includes(file.type)) { setUploadError(`Format non supporté : ${file.type}. Utilisez JPG, PNG ou WEBP.`); return }
    if (file.size > MAX) { setUploadError(`Fichier trop lourd : ${(file.size/1024/1024).toFixed(1)} Mo (max 2 Mo).`); return }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let imageUrl = null
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        const token = sessionStorage.getItem('calar_admin')
        const res = await fetch('/api/upload', { method:'POST', headers:{ Authorization:`Bearer ${token}` }, body: fd })
        if (!res.ok) throw new Error('Erreur upload image')
        const { url } = await res.json()
        imageUrl = url
      } else if (editId) {
        imageUrl = artworks.find(a => String(a.id) === String(editId))?.image_url || null
      }

      const body = {
        title: form.title, year: parseInt(form.year)||null, category: form.category,
        description: form.desc, technique: form.technique, dimensions: form.dimensions,
        price: parseFloat(form.price)||null, availability: form.availability,
        duration: form.duration || null, image_url: imageUrl
      }

      const url = editId ? `/api/artworks/${editId}` : '/api/artworks'
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) throw new Error(await res.text())

      showToast(editId ? '✓ Œuvre mise à jour !' : '✓ Œuvre ajoutée !')
      setSavedForm(null)
      resetForm()
      loadArtworks()
    } catch (err) {
      showToast('Erreur : ' + err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setForm({ title:'', year:'', category:'', desc:'', technique:'', dimensions:'', price:'', availability:'Disponible' })
    setEditId(''); setImageFile(null); setImagePreview(''); setUploadError('')
    setSavedForm(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleEdit = (a) => {
    const f = { title:a.title, year:a.year||'', category:a.category||'', desc:a.description||'', technique:a.technique||'', dimensions:a.dimensions||'', price:a.price||'', availability:a.availability||'Disponible', duration:a.duration||'' }
    setForm(f); setSavedForm(f)
    setEditId(a.id); setImagePreview(a.image_url||''); setTab('add')
    window.scrollTo(0, 200)
  }

  const handleDelete = async (a) => {
    if (!confirm(`Supprimer "${a.title}" définitivement ?\nCette action est irréversible.`)) return
    const res = await fetch(`/api/artworks/${a.id}`, { method:'DELETE', headers: authHeaders() })
    if (res.ok) { showToast('✓ Œuvre supprimée.'); loadArtworks() }
    else showToast('Erreur lors de la suppression.', 'error')
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/settings', { method:'POST', headers: authHeaders(), body: JSON.stringify(settings) })
    if (res.ok) {
      setSavedSettings({ ...settings })
      showToast('✓ Modifications sauvegardées !')
    } else {
      showToast('Erreur lors de la sauvegarde.', 'error')
    }
  }

  const inp = (field) => ({
    value: form[field],
    onChange: e => setForm(f => ({...f, [field]: e.target.value})),
    style: inputStyle
  })

  const isDirty = hasUnsavedChanges()

  return (
    <div style={{paddingTop:80, minHeight:'100vh', background:'#2a2520'}}>

      {/* Header BO */}
      <div style={{background:'#886f68', borderBottom:'1px solid rgba(197,110,74,0.15)', padding:'24px 32px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h1 style={{fontFamily:"'Cormorant Garant', serif", fontSize:28, fontWeight:400, color:'#f5f2ed'}}>Back Office</h1>
          <p style={{color:'rgba(245,242,237,0.7)', fontSize:12, marginTop:2}}>Calar.Artiste — Gestion du site</p>
        </div>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <a href="/" target="_blank" style={{fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--stone)', textDecoration:'none', padding:'8px 16px', border:'1px solid rgba(197,110,74,0.2)', background:'transparent'}}>
            Voir le site ↗
          </a>
          <button onClick={() => { sessionStorage.removeItem('calar_admin'); router.push('/') }} style={{fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'#c00', padding:'8px 16px', border:'1px solid rgba(196,49,43,0.2)', background:'transparent', cursor:'pointer'}}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{maxWidth:900, margin:'0 auto', padding:'32px 24px 80px'}}>

        {/* Tabs */}
        <div style={{display:'flex', gap:4, marginBottom:32, flexWrap:'wrap'}}>
          {[
            { key:'add', label: editId ? '✏️ Modifier l\'œuvre' : '+ Ajouter une œuvre' },
            { key:'list', label:`📋 Œuvres (${artworks.length})` },
            { key:'settings', label:'⚙️ Personnaliser' }
          ].map(({ key, label }) => (
            <button key={key} onClick={() => switchTab(key)}
              onMouseEnter={e => { if (tab !== key) { e.currentTarget.style.background = '#886f68'; e.currentTarget.style.color = '#f5f2ed' }}}
              onMouseLeave={e => { if (tab !== key) { e.currentTarget.style.background = 'var(--cream)'; e.currentTarget.style.color = 'var(--stone)' }}}
              style={{
                padding:'10px 20px', fontSize:12, fontWeight:500,
                letterSpacing:'0.06em', cursor:'pointer', fontFamily:'Inter, sans-serif',
                background: tab === key ? '#c56e4a' : 'var(--cream)',
                color: tab === key ? '#f5f2ed' : 'var(--stone)',
                border: '1px solid',
                borderColor: tab === key ? '#c56e4a' : 'rgba(197,110,74,0.2)',
                transition:'all 0.2s'
              }}>{label}</button>
          ))}
          {isDirty && (
            <span style={{alignSelf:'center', marginLeft:8, fontSize:11, color:'var(--gold)', fontWeight:500}}>
              ● Modifications non sauvegardées
            </span>
          )}
        </div>

        {/* ═══ AJOUTER / MODIFIER ═══ */}
        {tab === 'add' && (
          <form onSubmit={handleSave}>
            {editId && (
              <div style={{padding:'12px 16px', background:'rgba(197,110,74,0.08)', border:'1px solid rgba(197,110,74,0.2)', marginBottom:24, fontSize:13, color:'var(--gold)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span>✏️ Mode modification — {form.title}</span>
                <button type="button" onClick={resetForm} style={{fontSize:11, color:'var(--stone)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}>Annuler</button>
              </div>
            )}

            <Section title="Informations générales">
              <Field label="Titre *">
                <input {...inp('title')} required placeholder="Ex : Spirale" style={inputStyle}/>
              </Field>
              <Row>
                <Field label="Année *" hint="ex: 2024">
                  <input {...inp('year')} type="number" required placeholder="2024" style={inputStyle}/>
                </Field>
                <Field label="Catégorie">
                  <input {...inp('category')} placeholder="Abstrait, Paysage, Floral…" style={inputStyle}/>
                </Field>
              </Row>
              <Field label="Description" hint="Retours à la ligne et espaces conservés">
                <textarea {...inp('desc')} rows={6} style={{...inputStyle, resize:'vertical', whiteSpace:'pre-wrap', fontFamily:'Inter, sans-serif'}} placeholder={"Décrivez l'œuvre, son inspiration, ses émotions…\n\nVous pouvez utiliser des retours à la ligne."}/>
              </Field>
            </Section>

            <Section title="Détails techniques">
              <Row>
                <Field label="Technique">
                  <input {...inp('technique')} placeholder="Acrylique sur toile" style={inputStyle}/>
                </Field>
                <Field label="Dimensions">
                  <input {...inp('dimensions')} placeholder="60 × 80 cm" style={inputStyle}/>
                </Field>
              </Row>
              <Row>
                <Field label="Temps de réalisation" hint="ex: 3 semaines">
                  <input {...inp('duration')} placeholder="Ex : 2 semaines, 1 mois…" style={inputStyle}/>
                </Field>
                <Field label="Prix (€)">
                  <input {...inp('price')} type="number" placeholder="450" style={inputStyle}/>
                </Field>
              </Row>
              <Field label="Disponibilité">
                <select value={form.availability} onChange={e => setForm(f => ({...f, availability:e.target.value}))} style={inputStyle}>
                  <option>Disponible</option>
                  <option>Vendu</option>
                  <option>Sur commande</option>
                </select>
              </Field>
            </Section>

            <Section title="Image de l'œuvre">
              <Field label="Photo" hint="JPG, WEBP · max 2 Mo · idéal 1200×1600px">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{display:'none'}}/>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border:'2px dashed rgba(197,110,74,0.25)', padding:32,
                    textAlign:'center', background:'rgba(245,242,237,0.08)', cursor:'pointer',
                    transition:'border-color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(197,110,74,0.25)'}
                >
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" style={{maxHeight:200, objectFit:'contain', margin:'0 auto', display:'block'}}/>
                    : <>
                        <div style={{fontSize:32, marginBottom:8, opacity:0.35}}>🖼️</div>
                        <div style={{fontSize:13, color:'var(--stone)'}}>Cliquez pour sélectionner une image</div>
                      </>
                  }
                </div>
                {imagePreview && (
                  <button type="button" onClick={() => { setImagePreview(''); setImageFile(null); if(fileRef.current) fileRef.current.value='' }}
                    style={{marginTop:8, fontSize:11, color:'var(--stone)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}>
                    Supprimer l'image
                  </button>
                )}
                {uploadError && (
                  <div style={{marginTop:8, fontSize:12, color:'#c44', padding:'10px 14px', background:'rgba(196,49,43,0.08)', border:'1px solid rgba(196,49,43,0.2)'}}>
                    ⚠️ {uploadError}
                  </div>
                )}
              </Field>
            </Section>

            <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
              {editId && <button type="button" onClick={resetForm} style={{...btnSecondary}}>Annuler</button>}
              <button type="submit" disabled={saving} style={btnPrimary}>
                {saving ? 'Enregistrement…' : editId ? 'Mettre à jour l\'œuvre' : 'Ajouter l\'œuvre'}
              </button>
            </div>
          </form>
        )}

        {/* ═══ LISTE ═══ */}
        {tab === 'list' && (
          <div>
            {artworks.length === 0 ? (
              <div style={{textAlign:'center', padding:'80px 0', color:'var(--stone)'}}>
                <div style={{fontSize:40, marginBottom:16, opacity:0.3}}>🎨</div>
                <p>Aucune œuvre. Utilisez l'onglet <strong>Ajouter</strong> pour commencer.</p>
              </div>
            ) : (
              <>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                  <p style={{fontSize:12, color:'var(--stone)'}}>↕ Glissez pour réordonner</p>
                  <p style={{fontSize:12, color:'var(--stone)'}}>{artworks.length} œuvre{artworks.length > 1 ? 's' : ''}</p>
                </div>
                <div style={{display:'grid', gap:8}}>
                  {artworks.map((a, idx) => (
                    <div
                      key={a.id}
                      draggable
                      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', idx) }}
                      onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.background = 'rgba(197,110,74,0.05)' }}
                      onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(197,110,74,0.12)'; e.currentTarget.style.background = 'var(--white)' }}
                      onDrop={e => {
                        e.preventDefault()
                        e.currentTarget.style.borderColor = 'rgba(197,110,74,0.12)'
                        e.currentTarget.style.background = 'var(--white)'
                        const fromIdx = parseInt(e.dataTransfer.getData('text/plain'))
                        if (fromIdx === idx) return
                        const newList = [...artworks]
                        const [moved] = newList.splice(fromIdx, 1)
                        newList.splice(idx, 0, moved)
                        const updated = newList.map((item, i) => ({ ...item, sort_order: i }))
                        setArtworks(updated)
                        Promise.all(updated.map(item =>
                          fetch(`/api/artworks/${item.id}`, {
                            method:'PATCH', headers: authHeaders(),
                            body: JSON.stringify({ sort_order: item.sort_order })
                          })
                        )).then(() => showToast('✓ Ordre sauvegardé !'))
                      }}
                      style={{
                        display:'grid', gridTemplateColumns:'24px 72px 1fr auto',
                        alignItems:'center', gap:16,
                        padding:'12px 16px', background:'var(--cream)',
                        border:'1px solid rgba(197,110,74,0.12)',
                        cursor:'grab', userSelect:'none', transition:'all 0.15s'
                      }}
                    >
                      {/* Poignée */}
                      <span style={{color:'rgba(197,110,74,0.4)', fontSize:16, textAlign:'center'}}>⠿</span>

                      {/* Vignette */}
                      <div style={{width:72, height:72, position:'relative', background:'var(--light)', overflow:'hidden', flexShrink:0}}>
                        {a.image_url
                          ? <Image src={a.image_url} alt={a.title} fill style={{objectFit:'cover'}} unoptimized/>
                          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,opacity:0.25}}>🖼️</div>
                        }
                      </div>

                      {/* Info */}
                      <div>
                        <div style={{fontFamily:"'Cormorant Garant', serif", fontSize:18, fontWeight:400}}>{a.title}</div>
                        <div style={{fontSize:12, color:'var(--stone)', marginTop:2}}>
                          {[a.category, a.year, a.technique].filter(Boolean).join(' · ')}
                        </div>
                        <div style={{marginTop:4, display:'flex', gap:8, alignItems:'center'}}>
                          {a.price && <span style={{fontSize:12, color:'var(--gold)', fontWeight:500}}>{Number(a.price).toLocaleString('fr-FR')} €</span>}
                          <span style={{
                            fontSize:10, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase',
                            padding:'2px 8px',
                            background: a.availability === 'Disponible' ? 'rgba(96,111,82,0.12)' : a.availability === 'Vendu' ? 'rgba(196,49,43,0.1)' : 'rgba(197,110,74,0.1)',
                            color: a.availability === 'Disponible' ? 'var(--blue)' : a.availability === 'Vendu' ? 'var(--red)' : 'var(--gold)'
                          }}>{a.availability}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{display:'flex', gap:8, flexShrink:0}}>
                        <button onClick={() => handleEdit(a)} style={iconBtn}>Modifier</button>
                        <button onClick={() => handleDelete(a)} style={{...iconBtn, color:'var(--red)', borderColor:'rgba(196,49,43,0.2)'}}>Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ SETTINGS ═══ */}
        {tab === 'settings' && (
          <form onSubmit={handleSaveSettings}>

            {isDirty && (
              <div style={{padding:'12px 16px', background:'rgba(197,110,74,0.08)', border:'1px solid rgba(197,110,74,0.25)', marginBottom:24, fontSize:13, color:'var(--gold)'}}>
                ● Modifications non sauvegardées — pensez à enregistrer avant de quitter.
              </div>
            )}

            <Section title="🏠 Page d'accueil — Textes du hero">
              <Field label="Label coloré (au-dessus du titre)">
                <input value={settings.heroEyebrow} onChange={e=>setSettings(s=>({...s,heroEyebrow:e.target.value}))} style={inputStyle}/>
              </Field>
              <Row>
                <Field label="Titre — ligne 1">
                  <input value={settings.heroLine1} onChange={e=>setSettings(s=>({...s,heroLine1:e.target.value}))} style={inputStyle}/>
                </Field>
                <Field label="Titre — ligne 2 (italique doré)">
                  <input value={settings.heroLine2} onChange={e=>setSettings(s=>({...s,heroLine2:e.target.value}))} style={inputStyle}/>
                </Field>
              </Row>
              <Field label="Accroche / sous-titre">
                <textarea value={settings.heroDesc} onChange={e=>setSettings(s=>({...s,heroDesc:e.target.value}))} rows={3} style={{...inputStyle,resize:'vertical',whiteSpace:'pre-wrap'}}/>
              </Field>
              <Field label="Texte du bouton">
                <input value={settings.heroBtn} onChange={e=>setSettings(s=>({...s,heroBtn:e.target.value}))} style={inputStyle}/>
              </Field>
            </Section>

            <Section title="👩‍🎨 Bloc À propos (home)">
              <Row>
                <Field label="Titre — ligne 1">
                  <input value={settings.aboutLine1} onChange={e=>setSettings(s=>({...s,aboutLine1:e.target.value}))} style={inputStyle}/>
                </Field>
                <Field label="Titre — ligne 2 (italique doré)">
                  <input value={settings.aboutLine2} onChange={e=>setSettings(s=>({...s,aboutLine2:e.target.value}))} style={inputStyle}/>
                </Field>
              </Row>
              <Field label="Texte de présentation">
                <textarea value={settings.aboutText} onChange={e=>setSettings(s=>({...s,aboutText:e.target.value}))} rows={4} style={{...inputStyle,resize:'vertical',whiteSpace:'pre-wrap'}}/>
              </Field>
            </Section>

            <Section title="🖼️ Œuvres récentes (home)">
              <p style={{fontSize:12, color:'var(--stone)', marginBottom:16}}>Choisissez les 3 œuvres affichées dans la section "Œuvres récentes". Laissez vide pour afficher automatiquement les 3 dernières.</p>
              {[['recentId1','Œuvre 1'],['recentId2','Œuvre 2'],['recentId3','Œuvre 3']].map(([key, label]) => (
                <Field key={key} label={label}>
                  <select value={settings[key]} onChange={e=>setSettings(s=>({...s,[key]:e.target.value}))} style={inputStyle}>
                    <option value="">— Automatique —</option>
                    {artworks.map(a => <option key={a.id} value={a.id}>{a.title} ({a.year})</option>)}
                  </select>
                </Field>
              ))}
            </Section>

            <Section title="📄 Page À propos">
              <Row>
                <Field label="Nom / Titre">
                  <input value={settings.aboutPageTitle} onChange={e=>setSettings(s=>({...s,aboutPageTitle:e.target.value}))} style={inputStyle} placeholder="Clara"/>
                </Field>
                <Field label="Sous-titre">
                  <input value={settings.aboutPageSubtitle} onChange={e=>setSettings(s=>({...s,aboutPageSubtitle:e.target.value}))} style={inputStyle} placeholder="Infirmière & Artiste"/>
                </Field>
              </Row>
              <Field label="Introduction">
                <textarea value={settings.aboutPageIntro} onChange={e=>setSettings(s=>({...s,aboutPageIntro:e.target.value}))} rows={4} style={{...inputStyle,resize:'vertical',whiteSpace:'pre-wrap'}}/>
              </Field>
              <Field label="Démarche artistique">
                <textarea value={settings.aboutPageDemarche} onChange={e=>setSettings(s=>({...s,aboutPageDemarche:e.target.value}))} rows={4} style={{...inputStyle,resize:'vertical',whiteSpace:'pre-wrap'}}/>
              </Field>
              <Field label='Citation'>
                <input value={settings.aboutPageCitation} onChange={e=>setSettings(s=>({...s,aboutPageCitation:e.target.value}))} style={inputStyle}/>
              </Field>
              <Field label="Photo de l'artiste" hint="JPG, WEBP · max 2 Mo">
                <input type="file" accept="image/*" ref={photoRef} style={{display:'none'}}
                  onChange={async e => {
                    const file = e.target.files[0]
                    if (!file) return
                    const fd = new FormData()
                    fd.append('file', file)
                    const token = sessionStorage.getItem('calar_admin')
                    const res = await fetch('/api/upload', { method:'POST', headers:{ Authorization:`Bearer ${token}` }, body: fd })
                    if (res.ok) {
                      const { url } = await res.json()
                      setSettings(s => ({...s, aboutPagePhoto: url}))
                      showToast('✓ Photo uploadée !')
                    } else {
                      showToast('Erreur lors de l\'upload.', 'error')
                    }
                  }}
                />
                <div onClick={() => photoRef.current?.click()} style={{border:'2px dashed rgba(197,110,74,0.25)', padding:24, textAlign:'center', background:'rgba(245,242,237,0.08)', cursor:'pointer'}}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(197,110,74,0.25)'}
                >
                  {settings.aboutPagePhoto
                    ? <img src={settings.aboutPagePhoto} alt="Photo" style={{maxHeight:160, objectFit:'contain', margin:'0 auto', display:'block', borderRadius:2}}/>
                    : <div style={{opacity:0.4}}><div style={{fontSize:32, marginBottom:8}}>📷</div><div style={{fontSize:13, color:'var(--stone)'}}>Cliquez pour uploader une photo</div></div>
                  }
                </div>
              </Field>
            </Section>

            <div style={{display:'flex', justifyContent:'flex-end'}}>
              <button type="submit" style={btnPrimary}>Enregistrer toutes les modifications</button>
            </div>
          </form>
        )}
      </div>

      {/* Toast */}
      {toast.msg && (
        <div style={{
          position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
          background: toast.type === 'error' ? 'var(--red)' : 'var(--black)',
          color:'#e9e5da', padding:'14px 28px', fontSize:13, fontWeight:500,
          zIndex:999, boxShadow:'0 8px 24px rgba(0,0,0,0.2)',
          animation:'slideUp 0.3s ease'
        }}>{toast.msg}</div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 24px 72px"] { grid-template-columns: 72px 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

const inputStyle = { border:'1px solid rgba(197,110,74,0.2)', padding:'10px 12px', fontSize:14, fontFamily:'Inter, sans-serif', background:'#f5f2ed', color:'#2a2520', outline:'none', width:'100%', boxSizing:'border-box', transition:'border-color 0.2s' }
const btnPrimary = { padding:'12px 32px', background:'var(--gold)', color:'#e9e5da', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'Inter, sans-serif', transition:'background 0.2s' }
const btnSecondary = { padding:'12px 24px', background:'transparent', color:'var(--stone)', border:'1px solid rgba(197,110,74,0.2)', cursor:'pointer', fontSize:12, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'Inter, sans-serif' }
const iconBtn = { padding:'7px 14px', border:'1px solid rgba(197,110,74,0.2)', background:'transparent', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif', color:'var(--stone)', transition:'all 0.2s' }
