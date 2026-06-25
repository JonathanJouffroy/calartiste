import { NextResponse } from 'next/server'
import { checkAdminPassword } from '../../../lib/auth'

export async function POST(request) {
  const { password } = await request.json()

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }

  return NextResponse.json({ success: true, token: process.env.ADMIN_PASSWORD })
}
