import { NextResponse } from 'next/server'
import { isValidAdminSessionToken, getAdminCookieName } from '@/lib/admin-auth'
import { getSiteContent, saveSiteContent } from '@/lib/site-content'
import { isSiteContent } from '@/lib/site-content-schema'

function isAuthorized(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const session = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${getAdminCookieName()}=`))
    ?.split('=')
    .slice(1)
    .join('=')

  return isValidAdminSessionToken(session)
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const content = await getSiteContent()
  return NextResponse.json(content)
}

export async function PUT(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await request.json()
  if (!isSiteContent(body)) {
    return NextResponse.json({ error: 'Invalid content shape' }, { status: 400 })
  }

  await saveSiteContent(body)
  return NextResponse.json({ ok: true })
}
