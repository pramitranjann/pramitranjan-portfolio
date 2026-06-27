import { NextRequest, NextResponse } from "next/server";

import { isAuthenticatedLifeRequest, unauthorizedJson } from '@/lib/life/auth'
import { createCalendarEventForTask } from '@/lib/life/calendar'
import { getOwnerSettings } from '@/lib/life/settings'
import { createManualTask, getTasks, updateTask } from '@/lib/life/tasks'
import { getCurrentLocalDate } from '@/lib/life/time'
import type { TaskCalendarIntent, TaskRecord, TaskStatus } from '@/lib/life/types'

/**
 * Apply a calendar intent to a freshly created or edited task: push a new
 * Google event, link an existing one, or unlink. Best-effort — a calendar
 * failure must not lose the task itself, so the caller catches.
 */
export async function applyCalendarIntent(
  task: TaskRecord,
  intent: TaskCalendarIntent | null | undefined,
): Promise<TaskRecord> {
  if (!intent || intent.mode === 'none') return task

  if (intent.mode === 'event') {
    const settings = await getOwnerSettings()
    const localDate = task.due_local_date || getCurrentLocalDate(settings.timezone)
    const eventId = await createCalendarEventForTask({
      title: task.title,
      localDate,
      startTime: intent.startTime ?? null,
      endTime: intent.endTime ?? null,
      notes: task.details,
    })
    if (eventId) return updateTask(task.id, { calendarEventId: eventId })
    return task
  }

  if (intent.mode === 'link' && intent.eventId) {
    return updateTask(task.id, { calendarEventId: intent.eventId })
  }

  if (intent.mode === 'unlink') {
    return updateTask(task.id, { calendarEventId: null })
  }

  return task
}

function getSafeRedirectTo(value: string | null | undefined) {
  return value?.startsWith('/life') ? value : '/life/tasks'
}

export async function GET(request: NextRequest) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson();
  }

  try {
    const status = (request.nextUrl.searchParams.get('status') as TaskStatus | 'active' | 'all' | null) || 'active'
    const projectSlug = request.nextUrl.searchParams.get('project') || null
    const tasks = await getTasks({ status, projectSlug })
    return NextResponse.json({ tasks })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Task fetch failed.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson();
  }

  const contentType = request.headers.get('content-type') || ''
  const isJsonRequest = contentType.includes('application/json')
  let redirectTo = '/life/tasks'

  try {
    let payload: {
      title?: string
      details?: string | null
      projectSlug?: string | null
      dueLocalDate?: string | null
      priority?: string | null
      status?: TaskStatus | null
      redirectTo?: string | null
      calendar?: TaskCalendarIntent | null
      milestoneId?: string | null
      deskEligible?: boolean | null
    } | null = null

    if (isJsonRequest) {
      payload = (await request.json().catch(() => null)) as typeof payload
    } else {
      const formData = await request.formData().catch(() => null)
      payload = {
        title: typeof formData?.get('title') === 'string' ? String(formData.get('title')) : '',
        details: typeof formData?.get('details') === 'string' ? String(formData.get('details')) : null,
        projectSlug: typeof formData?.get('projectSlug') === 'string' ? String(formData.get('projectSlug')) : null,
        dueLocalDate: typeof formData?.get('dueLocalDate') === 'string' ? String(formData.get('dueLocalDate')) : null,
        priority: typeof formData?.get('priority') === 'string' ? String(formData.get('priority')) : null,
        redirectTo: typeof formData?.get('redirectTo') === 'string' ? String(formData.get('redirectTo')) : null,
      }
    }

    redirectTo = getSafeRedirectTo(payload?.redirectTo)

    let task = await createManualTask({
      title: payload?.title || '',
      details: payload?.details || null,
      projectSlug: payload?.projectSlug || null,
      dueLocalDate: payload?.dueLocalDate || null,
      priority: payload?.priority || null,
      status: payload?.status || null,
      milestoneId: payload?.milestoneId || null,
      deskEligible: payload?.deskEligible === true,
    })

    if (!isJsonRequest) {
      return NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 })
    }

    try {
      task = await applyCalendarIntent(task, payload?.calendar)
    } catch (calendarError) {
      console.error('Applying calendar intent to new task failed', calendarError)
    }

    return NextResponse.json({ task })
  } catch (error) {
    if (!isJsonRequest) {
      const url = new URL(redirectTo, request.url)
      url.searchParams.set('error', error instanceof Error ? error.message : 'Task creation failed.')
      return NextResponse.redirect(url, { status: 303 })
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Task creation failed.' }, { status: 500 })
  }
}
