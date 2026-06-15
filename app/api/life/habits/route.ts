import { NextRequest, NextResponse } from 'next/server'

import { isAuthenticatedLifeRequest, unauthorizedJson } from '@/lib/life/auth'
import { createHabit, getHabitsForDate } from '@/lib/life/habits'
import { getOwnerSettings } from '@/lib/life/settings'
import { getCurrentLocalDate } from '@/lib/life/time'

function getSafeRedirectTo(value: string | null | undefined) {
  return value?.startsWith('/life') ? value : '/life'
}

export async function GET(request: NextRequest) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson()
  }

  try {
    const settings = await getOwnerSettings()
    const date = request.nextUrl.searchParams.get('date') || getCurrentLocalDate(settings.timezone)
    const habits = await getHabitsForDate(date)
    return NextResponse.json({ localDate: date, timezone: settings.timezone, habits })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load habits.' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson()
  }

  const contentType = request.headers.get('content-type') || ''
  const isJsonRequest = contentType.includes('application/json')
  let redirectTo = '/life'

  try {
    let title = ''
    let cadence: string | null = null

    if (isJsonRequest) {
      const body = (await request.json().catch(() => null)) as {
        title?: string
        cadence?: string | null
        redirectTo?: string | null
      } | null
      title = body?.title?.trim() || ''
      cadence = body?.cadence || null
      redirectTo = getSafeRedirectTo(body?.redirectTo)
    } else {
      const formData = await request.formData().catch(() => null)
      title = typeof formData?.get('title') === 'string' ? String(formData.get('title')).trim() : ''
      cadence = typeof formData?.get('cadence') === 'string' ? String(formData.get('cadence')) : null
      redirectTo = getSafeRedirectTo(
        typeof formData?.get('redirectTo') === 'string' ? String(formData.get('redirectTo')) : null,
      )
    }

    if (!title) {
      if (!isJsonRequest) {
        return NextResponse.redirect(new URL(`${redirectTo}?error=habit-title`, request.url), {
          status: 303,
        })
      }
      return NextResponse.json({ error: 'Habit title is required.' }, { status: 400 })
    }

    const habit = await createHabit({ title, cadence })

    if (!isJsonRequest) {
      return NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 })
    }

    return NextResponse.json({ habit })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Habit creation failed.'
    if (!isJsonRequest) {
      const url = new URL(redirectTo, request.url)
      url.searchParams.set('error', message)
      return NextResponse.redirect(url, { status: 303 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
