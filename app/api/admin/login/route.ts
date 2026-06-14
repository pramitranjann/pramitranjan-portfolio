import { NextRequest, NextResponse } from 'next/server'
import { createAdminSessionToken, getAdminCookieName, verifyAdminPassword } from '@/lib/admin-auth'
import {
  clearLoginThrottleState,
  getLoginThrottleState,
  isSameOriginRequest,
  recordFailedLoginAttempt,
} from '@/lib/security'

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }

  const throttleState = getLoginThrottleState(request)
  if (throttleState.limited) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': `${throttleState.retryAfterSeconds}` },
      }
    )
  }

  try {
    const body = await request.json()
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!password || !verifyAdminPassword(password)) {
      const failedAttempt = recordFailedLoginAttempt(request)
      return NextResponse.json(
        {
          error: failedAttempt.limited
            ? 'Too many login attempts. Try again later.'
            : 'Invalid password',
        },
        {
          status: failedAttempt.limited ? 429 : 401,
          headers: { 'Retry-After': `${failedAttempt.retryAfterSeconds}` },
        }
      )
    }

    clearLoginThrottleState(request)

    const response = NextResponse.json({ ok: true })
    response.cookies.set(getAdminCookieName(), createAdminSessionToken(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 14,
      priority: 'high',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
