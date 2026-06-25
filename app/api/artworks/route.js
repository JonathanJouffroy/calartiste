import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { isAuthorized } from '../../../lib/auth'

// GET — lecture publique
export async function GET() {
  const { data, error } = await supabase
    .from('artworks').select('*').order('sort_order').order('created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — création (admin uniquement)
export async function POST(request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabaseAdmin
    .from('artworks').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
