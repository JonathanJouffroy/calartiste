'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const DEFAULT_SETTINGS = {
  heroLine1: "L'art qui fait", heroLine2: 'voyager',
  heroDesc: 'Entre émotion, nature et guérison — chaque toile de Clara est un voyage intérieur peint avec sincérité et énergie.',
  heroBtn: 'Voir les œuvres', heroEyebrow: 'Art intuitif & abstrait',
  aboutLine1: 'Infirmière', aboutLine2: 'artiste',
  aboutText: "Clara est infirmière le jour, artiste en permanence. Son art intuitif et abstrait puise dans les émotions du soin, la beauté de la nature et le chemin vers la guérison.",
  featuredId: '',
  recentId1: '', recentId2: '', recentId3: '',
  aboutPageTitle:    'Clara',
  aboutPageSubtitle: 'Infirmière & Artiste',
  aboutPageIntro:    "Clara est infirmière le jour, artiste en permanence. Son art intuitif et abstrait puise dans les émotions du soin, la beauté de la nature et le chemin vers la guérison.",
  aboutPageDemarche: "Chaque toile naît d'une émotion, d'un moment suspendu, d'une couleur aperçue dans la lumière du matin.",
  aboutPageCitation: '"Mon art vous fait voyager entre émotion, nature et guérison."',
  aboutPagePhoto:    '',
}

function authHeaders() {
  const token = sessionStorage.getItem('calar_admin')
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState('add')
  const [artworks, setArtworks] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [toast, setToast] = useState('')
  const [editId, setEditId] = useState('')
  const [form, setForm] = useState({ title:'', year:'', category:'', desc:'', technique:'', dimensions:'', price:'', availability:'Disponible' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  // Auth check
  useEffect(() => {
    if (!sessionStorage.getItem('calar_admin')) router.push('/admin/login')
  }, [])

  // Load artworks
  const loadArtworks = async () => {
    const res = await fetch('/api/artworks')
    setArtworks(await res.json())
  }

  // Load settings
  const loadSettings = async () => {
    const res = await fetch('/api/settings')
    const rows = await res.json()
    const s = { ...DEFAULT_SETTINGS }
    rows.forEach(r => { if (r.key in s) s[r.key] = r.value })
    setSettings(s)
  }

  useEffect(() => { loadArtworks(); loadSettings() }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // Image validation
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

  // Save artwork
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let imageUrl = imagePreview && !imagePreview.startsWith('http') ? null : (artworks.find(a => String(a.id) === String(editId))?.image_url || null)

      // Upload image si nouveau fichier
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

      const body = { title:form.title, year:parseInt(form.year)||null, category:form.category, description:form.desc, technique:form.technique, dimensions:form.dimensions, price:parseFloat(form.price)||null, availability:form.availability, image_url:imageUrl }

      const url = editId ? `/api/artworks/${editId}` : '/api/artworks'
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) throw new Error(await res.text())

      showToast(editId ? 'Œuvre mise à jour !' : 'Œuvre ajoutée !')
      resetForm()
      loadArtworks()
    } catch (err) {
      showToast('Erreur : ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setForm({ title:'', year:'', category:'', desc:'', technique:'', dimensions:'', price:'', availability:'Disponible' })
    setEditId(''); setImageFile(null); setImagePreview(''); setUploadError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleEdit = (a) => {
    setForm({ title:a.title, year:a.year||'', category:a.category||'', desc:a.description||'', technique:a.technique||'', dimensions:a.dimensions||'', price:a.price||'', availability:a.availability||'Disponible' })
    setEditId(a.id); setImagePreview(a.image_url||''); setTab('add')
    window.scrollTo(0, 200)
  }

  const handleDelete = async (a) => {
    if (!confirm(`Supprimer "${a.title}" définitivement ?`)) return
    const res = await fetch(`/api/artworks/${a.id}`, { method:'DELETE', headers: authHeaders() })
    if (res.ok) { showToast('Œuvre supprimée.'); loadArtworks() }
    else showToast('Erreur lors de la suppression.')
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/settings', { method:'POST', headers: authHeaders(), body: JSON.stringify(settings) })
    if (res.ok) showToast('Page d\'accueil mise à jour !')
    else showToast('Erreur lors de la sauvegarde.')
  }

  const inp = (field) => ({
    value: form[field],
    onChange: e => setForm(f => ({...f, [field]: e.target.value})),
    style: inputStyle
  })

  return (
    <div style={{paddingTop:80, minHeight:'100vh', background:'var(--cream)'}}>
      <div style={{maxWidth:860, margin:'0 auto', padding:'40px 24px 80px'}}>
        <h1 style={{fontFamily:"'Cormorant Garant', serif", fontSize:42, fontWeight:300, marginBottom:8}}>Back Office</h1>
        <p style={{color:'var(--stone)', fontSize:13, marginBottom:48}}>Gérez les œuvres de la galerie</p>

        {/* Tabs */}
        <div style={{display:'flex', flexWrap:'wrap', borderBottom:'1px solid rgba(197,110,74,0.2)', marginBottom:40}}>
          {[['add','+ Ajouter'],['list','Liste des œuvres'],['settings','⚙ Personnaliser']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding:'10px 18px', fontSize:11, fontWeight:500, letterSpacing:'0.08em',
              textTransform:'uppercase', cursor:'pointer', background:'transparent', border:'none',
              borderBottom: tab===key ? '2px solid var(--gold)' : '2px solid transparent',
              color: tab===key ? 'var(--gold)' : 'var(--stone)', fontFamily:'Inter, sans-serif'
            }}>{label}</button>
          ))}
        </div>

        {/* ADD / EDIT */}
        {tab === 'add' && (
          <form onSubmit={handleSave} style={{display:'grid', gap:20}}>
            <div style={rowStyle}>
              <FormField label="Titre *"><input {...inp('title')} required placeholder="Spirale"/></FormField>
              <FormField label="Année *"><input {...inp('year')} type="number" required placeholder="2024"/></FormField>
            </div>
            <FormField label="Catégorie"><input {...inp('category')} placeholder="Abstrait, Paysage…"/></FormField>
            <FormField label="Description"><textarea {...inp('desc')} rows={4} style={{...inputStyle, resize:'vertical'}} placeholder="Décrivez l'œuvre…"/></FormField>
            <div style={rowStyle}>
              <FormField label="Technique"><input {...inp('technique')} placeholder="Acrylique sur toile"/></FormField>
              <FormField label="Dimensions"><input {...inp('dimensions')} placeholder="60 × 80 cm"/></FormField>
            </div>
            <div style={rowStyle}>
              <FormField label="Prix (€)"><input {...inp('price')} type="number" placeholder="450"/></FormField>
              <FormField label="Disponibilité">
                <select value={form.availability} onChange={e => setForm(f=>({...f,availability:e.target.value}))} style={inputStyle}>
                  <option>Disponible</option><option>Vendu</option><option>Sur commande</option>
                </select>
              </FormField>
            </div>

            <FormField label="Image">
              <div style={{border:'2px dashed rgba(197,110,74,0.25)', padding:32, textAlign:'center', position:'relative', background:'var(--light)', cursor:'pointer'}}>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange}
                  style={{position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%', height:'100%'}}/>
                <div style={{fontSize:28, marginBottom:8, opacity:0.4}}>🖼️</div>
                <div style={{fontSize:13, color:'var(--stone)'}}>Cliquez ou glissez une image<br/><small>JPG, WEBP · max 2 Mo · idéal 1200×1600px</small></div>
                {imagePreview && <img src={imagePreview} alt="preview" style={{maxHeight:180, objectFit:'contain', margin:'12px auto 0', display:'block'}}/>}
              </div>
              {uploadError && <div style={{fontSize:12, color:'#c44', marginTop:8, padding:'10px 14px', background:'rgba(196,49,43,0.08)', border:'1px solid rgba(196,49,43,0.2)'}}>{uploadError}</div>}
            </FormField>

            <div style={{display:'flex', gap:12}}>
              <button type="submit" disabled={saving} style={btnStyle}>{saving ? 'Enregistrement…' : editId ? 'Mettre à jour' : 'Ajouter l\'œuvre'}</button>
              {editId && <button type="button" onClick={resetForm} style={{...btnStyle, background:'var(--stone)'}}>Annuler</button>}
            </div>
          </form>
        )}

        {/* LIST avec drag & drop */}
        {tab === 'list' && (
          <div>
            {artworks.length === 0
              ? <div style={{textAlign:'center', padding:'80px 0', color:'var(--stone)'}}>Aucune œuvre. Ajoutez-en depuis l'onglet "Ajouter".</div>
              : <>
                  <p style={{fontSize:12, color:'var(--stone)', marginBottom:16}}>
                    ↕ Glissez les œuvres pour les réordonner
                  </p>
                  <div style={{display:'grid', gap:8}}>
                    {artworks.map((a, idx) => (
                      <div
                        key={a.id}
                        draggable
                        onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', idx) }}
                        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gold)' }}
                        onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(197,110,74,0.1)' }}
                        onDrop={e => {
                          e.preventDefault()
                          e.currentTarget.style.borderColor = 'rgba(197,110,74,0.1)'
                          const fromIdx = parseInt(e.dataTransfer.getData('text/plain'))
                          const toIdx = idx
                          if (fromIdx === toIdx) return
                          const newList = [...artworks]
                          const [moved] = newList.splice(fromIdx, 1)
                          newList.splice(toIdx, 0, moved)
                          // Met à jour sort_order
                          const updated = newList.map((item, i) => ({ ...item, sort_order: i }))
                          setArtworks(updated)
                          // Sauvegarde en base
                          Promise.all(updated.map(item =>
                            fetch(`/api/artworks/${item.id}`, {
                              method: 'PATCH',
                              headers: authHeaders(),
                              body: JSON.stringify({ sort_order: item.sort_order })
                            })
                          )).then(() => showToast('Ordre sauvegardé !'))
                        }}
                        style={{
                          display:'flex', alignItems:'center', gap:20,
                          padding:'14px 20px', background:'var(--light)',
                          border:'1px solid rgba(197,110,74,0.1)',
                          cursor:'grab', transition:'border-color 0.2s',
                          userSelect:'none'
                        }}
                      >
                        {/* Poignée drag */}
                        <span style={{fontSize:18, opacity:0.3, flexShrink:0, cursor:'grab'}}>⠿</span>

                        <div style={{width:48, height:48, flexShrink:0, overflow:'hidden', background:'var(--cream)', position:'relative'}}>
                          {a.image_url
                            ? <Image src={a.image_url} alt={a.title} fill style={{objectFit:'cover'}} unoptimized/>
                            : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>🖼️</div>
                          }
                        </div>

                        <div style={{flex:1, minWidth:0}}>
                          <div style={{fontFamily:"'Cormorant Garant', serif", fontSize:17, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.title}</div>
                          <div style={{fontSize:11, color:'var(--stone)', marginTop:2}}>{a.category} · {a.year} · {a.availability}</div>
                        </div>

                        <div style={{display:'flex', gap:8, flexShrink:0}}>
                          <button onClick={() => handleEdit(a)} style={iconBtnStyle}>Modifier</button>
                          <button onClick={() => handleDelete(a)} style={{...iconBtnStyle, color:'var(--red)'}}>Supprimer</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
            }
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <form onSubmit={handleSaveSettings} style={{display:'grid', gap:20}}>
            <SectionTitle>Textes de la page d'accueil</SectionTitle>
            <FormField label="Label au-dessus du titre">
              <input value={settings.heroEyebrow} onChange={e=>setSettings(s=>({...s,heroEyebrow:e.target.value}))} style={inputStyle}/>
            </FormField>
            <div style={rowStyle}>
              <FormField label="Titre ligne 1"><input value={settings.heroLine1} onChange={e=>setSettings(s=>({...s,heroLine1:e.target.value}))} style={inputStyle}/></FormField>
              <FormField label="Titre ligne 2 (italique)"><input value={settings.heroLine2} onChange={e=>setSettings(s=>({...s,heroLine2:e.target.value}))} style={inputStyle}/></FormField>
            </div>
            <FormField label="Accroche"><textarea value={settings.heroDesc} onChange={e=>setSettings(s=>({...s,heroDesc:e.target.value}))} rows={3} style={{...inputStyle,resize:'vertical'}}/></FormField>
            <FormField label="Texte du bouton"><input value={settings.heroBtn} onChange={e=>setSettings(s=>({...s,heroBtn:e.target.value}))} style={inputStyle}/></FormField>

            <hr style={{border:'none', borderTop:'1px solid rgba(197,110,74,0.2)', margin:'8px 0'}}/>
            <SectionTitle>Bloc "À propos"</SectionTitle>
            <div style={rowStyle}>
              <FormField label="Titre ligne 1"><input value={settings.aboutLine1} onChange={e=>setSettings(s=>({...s,aboutLine1:e.target.value}))} style={inputStyle}/></FormField>
              <FormField label="Titre ligne 2 (italique)"><input value={settings.aboutLine2} onChange={e=>setSettings(s=>({...s,aboutLine2:e.target.value}))} style={inputStyle}/></FormField>
            </div>
            <FormField label="Texte de présentation"><textarea value={settings.aboutText} onChange={e=>setSettings(s=>({...s,aboutText:e.target.value}))} rows={5} style={{...inputStyle,resize:'vertical'}}/></FormField>

            <hr style={{border:'none', borderTop:'1px solid rgba(197,110,74,0.2)', margin:'8px 0'}}/>
            <SectionTitle>Page "À propos"</SectionTitle>
            <div style={rowStyle}>
              <FormField label="Nom / Titre">
                <input value={settings.aboutPageTitle} onChange={e=>setSettings(s=>({...s,aboutPageTitle:e.target.value}))} style={inputStyle} placeholder="Clara"/>
              </FormField>
              <FormField label="Sous-titre">
                <input value={settings.aboutPageSubtitle} onChange={e=>setSettings(s=>({...s,aboutPageSubtitle:e.target.value}))} style={inputStyle} placeholder="Infirmière & Artiste"/>
              </FormField>
            </div>
            <FormField label="Introduction">
              <textarea value={settings.aboutPageIntro} onChange={e=>setSettings(s=>({...s,aboutPageIntro:e.target.value}))} rows={4} style={{...inputStyle,resize:'vertical'}}/>
            </FormField>
            <FormField label="Démarche artistique">
              <textarea value={settings.aboutPageDemarche} onChange={e=>setSettings(s=>({...s,aboutPageDemarche:e.target.value}))} rows={4} style={{...inputStyle,resize:'vertical'}}/>
            </FormField>
            <FormField label='Citation (ex: "Mon art vous fait voyager…")'>
              <input value={settings.aboutPageCitation} onChange={e=>setSettings(s=>({...s,aboutPageCitation:e.target.value}))} style={inputStyle}/>
            </FormField>
            <FormField label="Photo de l'artiste">
              <div style={{border:'2px dashed rgba(197,110,74,0.25)', padding:24, textAlign:'center', position:'relative', background:'var(--light)', cursor:'pointer'}}>
                <input type="file" accept="image/*" onChange={async e => {
                  const file = e.target.files[0]
                  if (!file) return
                  const fd = new FormData()
                  fd.append('file', file)
                  const token = sessionStorage.getItem('calar_admin')
                  const res = await fetch('/api/upload', { method:'POST', headers:{ Authorization:`Bearer ${token}` }, body: fd })
                  if (res.ok) {
                    const { url } = await res.json()
                    setSettings(s => ({...s, aboutPagePhoto: url}))
                    showToast('Photo uploadée !')
                  }
                }} style={{position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%', height:'100%'}}/>
                {settings.aboutPagePhoto
                  ? <img src={settings.aboutPagePhoto} alt="Photo" style={{maxHeight:160, objectFit:'contain', margin:'0 auto', display:'block', borderRadius:2}}/>
                  : <div style={{opacity:0.4}}><div style={{fontSize:32, marginBottom:8}}>📷</div><div style={{fontSize:13, color:'var(--stone)'}}>Cliquez pour uploader une photo</div></div>
                }
              </div>
            </FormField>

            <hr style={{border:'none', borderTop:'1px solid rgba(197,110,74,0.2)', margin:'8px 0'}}/>
            <SectionTitle>Œuvre à la une</SectionTitle>
            <FormField label="Choisir l'œuvre">
              <select value={settings.featuredId} onChange={e=>setSettings(s=>({...s,featuredId:e.target.value}))} style={inputStyle}>
                <option value="">— Première œuvre (par défaut) —</option>
                {artworks.map(a => <option key={a.id} value={a.id}>{a.title} ({a.year})</option>)}
              </select>
            </FormField>

            <hr style={{border:'none', borderTop:'1px solid rgba(197,110,74,0.2)', margin:'8px 0'}}/>
            <SectionTitle>Œuvres récentes</SectionTitle>
            <p style={{fontSize:12, color:'var(--stone)', marginTop:-12}}>Choisissez les 3 œuvres affichées dans la section "Œuvres récentes" de la home. Par défaut, les 3 dernières ajoutées.</p>
            {[['recentId1','Œuvre récente 1'],['recentId2','Œuvre récente 2'],['recentId3','Œuvre récente 3']].map(([key, label]) => (
              <FormField key={key} label={label}>
                <select value={settings[key]} onChange={e=>setSettings(s=>({...s,[key]:e.target.value}))} style={inputStyle}>
                  <option value="">— Automatique (dernières ajoutées) —</option>
                  {artworks.map(a => <option key={a.id} value={a.id}>{a.title} ({a.year})</option>)}
                </select>
              </FormField>
            ))}

            <button type="submit" style={btnStyle}>Enregistrer les modifications</button>
          </form>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
          background:'var(--gold)', color:'#e9e5da', padding:'14px 28px',
          fontSize:13, fontWeight:600, zIndex:999
        }}>{toast}</div>
      )}
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div style={{display:'grid', gap:8, minWidth:0}}>
      <label style={{fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--stone)'}}>{label}</label>
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return <h2 style={{fontFamily:"'Cormorant Garant', serif", fontSize:22, fontWeight:400, color:'var(--black)'}}>{children}</h2>
}

const inputStyle = { border:'1px solid rgba(197,110,74,0.2)', padding:'11px 12px', fontSize:14, fontFamily:'Inter, sans-serif', background:'var(--light)', color:'var(--black)', outline:'none', width:'100%', boxSizing:'border-box' }
const btnStyle = { padding:'14px 40px', background:'var(--gold)', color:'#e9e5da', border:'none', cursor:'pointer', fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'Inter, sans-serif' }
const iconBtnStyle = { padding:'8px 14px', border:'1px solid rgba(197,110,74,0.2)', background:'transparent', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif', color:'var(--stone)' }
const rowStyle = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }
