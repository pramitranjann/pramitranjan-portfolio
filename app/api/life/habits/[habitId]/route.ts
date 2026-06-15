import { NextRequest, NextResponse } from 'next/server'

import { isAuthenticatedLifeRequest, unauthorizedJson } from '@/lib/life/auth'
import { toggleHabitForDate } from '@/lib/life/habits'
import { getOwnerSettings } from '@/lib/life/settings'
import { getCurrentLocalDate } from '@/lib/life/time'

function getSafeRedirectTo(value: string | null | undefined) {
  return value?.startsWith('/life') ? value : '/life'
}

export async function POST(request: NextRequest, context: { params: Promise<unknown> }) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson()
  }

  const { habitId } = (await context.params) as { habitId: string }
  const contentType = request.headers.get('content-type') || ''
  const isJsonRequest = contentType.includes('application/json')
  let redirectTo = '/life'

  try {
    const settings = await getOwnerSettings()
    const fallbackDate = getCurrentLocalDate(settings.timezone)
    let localDate = fallbackDate

    if (isJsonRequest) {
      const body = (await request.json().catch(() => null)) as {
        localDate?: string
        redirectTo?: string | null
      } | null
      localDate = body?.localDate || fallbackDate
      redirectTo = getSafeRedirectTo(body?.redirectTo)
    } else {
      const formData = await request.formData().catch(() => null)
      localDate =
        typeof formData?.get('localDate') === 'string'
          ? String(formData.get('localDate'))
          : fallbackDate
      redirectTo = getSafeRedirectTo(
        typeof formData?.get('redirectTo') === 'string' ? String(formData.get('redirectTo')) : null,
      )
    }

    const done = await toggleHabitForDate(habitId, localDate)

    if (!isJsonRequest) {
      return NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 })
    }

    return NextResponse.json({ done })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Habit update failed.'
    if (!isJsonRequest) {
      const url = new URL(redirectTo, request.url)
      url.searchParams.set('error', message)
      return NextResponse.redirect(url, { status: 303 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
