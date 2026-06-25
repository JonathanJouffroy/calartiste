import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAuthorized } from '@/lib/auth'

// PATCH — modification (admin uniquement)
export async function PATCH(request, { params }) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json()
  const { error } = await supabaseAdmin
    .from('artworks').update(body).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE — suppression (admin uniquement)
export async function DELETE(request, { params }) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Récupère l'image avant suppression pour la supprimer du Storage
  const { data: artwork } = await supabaseAdmin
    .from('artworks').select('image_url').eq('id', params.id).single()

  const { error } = await supabaseAdmin
    .from('artworks').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Supprime l'image du Storage si elle existe
  if (artwork?.image_url?.includes('/storage/')) {
    const filename = artwork.image_url.split('/artworks/').pop()
    await supabaseAdmin.storage.from('artworks').remove([filename])
  }

  return NextResponse.json({ success: true })
}
