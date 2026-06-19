import { NextRequest, NextResponse } from 'next/server'

import { isAuthenticatedLifeRequest, unauthorizedJson } from '@/lib/life/auth'
import { createCalendarEvent, syncCalendarEvents } from '@/lib/life/calendar'
import { getOwnerSettings } from '@/lib/life/settings'
import { getCurrentLocalDate } from '@/lib/life/time'

function getSafeRedirectTo(value: string | null | undefined) {
  return value?.startsWith('/life') ? value : '/life'
}

function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function POST(request: NextRequest) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson()
  }

  const contentType = request.headers.get('content-type') || ''
  const isJsonRequest = contentType.includes('application/json')
  let redirectTo = '/life'

  try {
    const settings = await getOwnerSettings()
    const fallbackDate = getCurrentLocalDate(settings.timezone)

    let title = ''
    let localDate = fallbackDate
    let startTime: string | null = null
    let endTime: string | null = null
    let allDay = false
    let calendarId: string | null = null
    let location: string | null = null
    let notes: string | null = null

    if (isJsonRequest) {
      const body = (await request.json().catch(() => null)) as {
        title?: string
        localDate?: string
        startTime?: string | null
        endTime?: string | null
        allDay?: boolean
        calendarId?: string | null
        location?: string | null
        notes?: string | null
        redirectTo?: string | null
      } | null
      title = body?.title?.trim() || ''
      localDate = body?.localDate || fallbackDate
      startTime = body?.startTime || null
      endTime = body?.endTime || null
      allDay = Boolean(body?.allDay)
      calendarId = normalizeOptionalText(body?.calendarId)
      location = normalizeOptionalText(body?.location)
      notes = normalizeOptionalText(body?.notes)
      redirectTo = getSafeRedirectTo(body?.redirectTo)
    } else {
      const formData = await request.formData().catch(() => null)
      const read = (key: string) =>
        typeof formData?.get(key) === 'string' ? String(formData.get(key)).trim() : ''
      title = read('title')
      localDate = read('localDate') || fallbackDate
      startTime = read('startTime') || null
      endTime = read('endTime') || null
      allDay = formData?.get('allDay') === 'on' || formData?.get('allDay') === 'true'
      calendarId = normalizeOptionalText(read('calendarId'))
      location = normalizeOptionalText(read('location'))
      notes = normalizeOptionalText(read('notes'))
      redirectTo = getSafeRedirectTo(read('redirectTo') || null)
    }

    if (!title) {
      if (!isJsonRequest) {
        return NextResponse.redirect(new URL(`${redirectTo}?error=event-title`, request.url), {
          status: 303,
        })
      }
      return NextResponse.json({ error: 'Event title is required.' }, { status: 400 })
    }

    const event = await createCalendarEvent({
      title,
      localDate,
      startTime,
      endTime,
      allDay,
      calendarId,
      location,
      notes,
    })

    try {
      await syncCalendarEvents(localDate, undefined, { force: true })
    } catch (syncError) {
      console.error('Calendar sync after event creation failed', syncError)
    }

    if (!isJsonRequest) {
      return NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Event creation failed.'
    if (!isJsonRequest) {
      const url = new URL(redirectTo, request.url)
      url.searchParams.set('error', message)
      return NextResponse.redirect(url, { status: 303 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
