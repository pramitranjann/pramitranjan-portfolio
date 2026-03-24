import { NextResponse } from 'next/server'
import { createAdminSessionToken, getAdminCookieName, verifyAdminPassword } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(getAdminCookieName(), createAdminSessionToken(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 14,
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 }
    )
  }
}
