import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAuthorized } from '@/lib/auth'

// GET — lecture publique
export async function GET() {
  const { data, error } = await supabase.from('settings').select('key, value')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — mise à jour (admin uniquement)
export async function POST(request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const settings = await request.json() // { heroLine1: '...', heroLine2: '...', ... }
  const entries = Object.entries(settings).map(([key, value]) => ({
    key, value: String(value ?? ''), updated_at: new Date().toISOString()
  }))

  const { error } = await supabaseAdmin
    .from('settings')
    .upsert(entries, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
