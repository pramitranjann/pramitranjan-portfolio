import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { hasValidAdminSession } from '@/lib/admin-auth'
import { getDashboardWriteMode } from '@/lib/dashboard-storage'
import { publishSiteContentToGitHub } from '@/lib/github-content'
import { getSiteContent, saveSiteContent } from '@/lib/site-content'
import { isSameOriginRequest } from '@/lib/security'
import { isSiteContent } from '@/lib/site-content-schema'

export async function GET(request: NextRequest) {
  if (!hasValidAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const content = await getSiteContent()
  return NextResponse.json(content)
}

export async function PUT(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }

  if (!hasValidAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    if (!isSiteContent(body)) {
      return NextResponse.json({ error: 'Invalid content shape' }, { status: 400 })
    }

    const writeMode = getDashboardWriteMode()

    if (writeMode === 'readonly') {
      return NextResponse.json(
        {
          error: 'Dashboard saves are not configured here. Set up GitHub publish env vars or run the site locally.',
        },
        { status: 409 }
      )
    }

    if (writeMode === 'local') {
      await saveSiteContent(body)
      revalidatePath('/', 'layout')
      return NextResponse.json({ ok: true, mode: 'local' })
    }

    const result = await publishSiteContentToGitHub(body)
    revalidatePath('/', 'layout')
    return NextResponse.json({
      ok: true,
      mode: 'github',
      commitSha: result.commitSha,
      commitUrl: result.commitUrl,
      path: result.path,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Save failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
