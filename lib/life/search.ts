import 'server-only'

import { OWNER_ID } from '@/lib/life/constants'
import { getEntryPresentation } from '@/lib/life/entries'
import { getProjectLabel } from '@/lib/life/projects'
import { getOwnerSettings } from '@/lib/life/settings'
import { getSupabaseAdmin } from '@/lib/life/supabase'
import { getLocalTimeLabel, localDateTimeToUtc } from '@/lib/life/time'
import type {
  CalendarEventRecord,
  EntryRecord,
  LifeSearchResults,
  TaskRecord,
} from '@/lib/life/types'

function shortDay(localDate: string, timeZone: string) {
  const date = localDateTimeToUtc(localDate, timeZone, 12, 0)
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).formatToParts(date)
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${lookup.weekday} ${lookup.day} ${lookup.month}`
}

function sanitizeSearchQuery(value: string) {
  return value.replace(/[%,]/g, ' ').trim()
}

export async function searchLife(rawQuery: string): Promise<LifeSearchResults> {
  const query = rawQuery.trim()
  const hasQuery = query.length > 0
  const term = sanitizeSearchQuery(query)

  if (term.length < 2) {
    return {
      query,
      hasQuery,
      totalResults: 0,
      tasks: [],
      entries: [],
      events: [],
    }
  }

  const settings = await getOwnerSettings()
  const timeZone = settings.timezone
  const supabase = getSupabaseAdmin()
  const like = `%${term}%`

  const [taskRes, entryRes, eventRes] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', OWNER_ID)
      .neq('status', 'dismissed')
      .or(`title.ilike.${like},details.ilike.${like}`)
      .order('created_at', { ascending: false })
      .limit(24)
      .returns<TaskRecord[]>(),
    supabase
      .from('entries')
      .select('*')
      .eq('user_id', OWNER_ID)
      .ilike('content', like)
      .order('created_at', { ascending: false })
      .limit(24)
      .returns<EntryRecord[]>(),
    supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', OWNER_ID)
      .ilike('title', like)
      .order('start_time', { ascending: false })
      .limit(24)
      .returns<CalendarEventRecord[]>(),
  ])

  if (taskRes.error) throw new Error(taskRes.error.message)
  if (entryRes.error) throw new Error(entryRes.error.message)
  if (eventRes.error) throw new Error(eventRes.error.message)

  const tasks = (taskRes.data || []).map((task) => ({
    id: task.id,
    href: '/life/tasks',
    title: task.title,
    status: task.status,
    priority: task.priority,
    projectLabel: task.project_slug
      ? getProjectLabel(task.project_slug) || task.project_slug
      : 'General',
    dueLabel: task.due_local_date ? shortDay(task.due_local_date, timeZone) : null,
  }))

  const entries = (entryRes.data || []).map((entry) => {
    const presentation = getEntryPresentation(entry)
    return {
      id: entry.id,
      href: '/life/history',
      content: entry.content,
      kind: presentation.kind,
      kindColor: presentation.color,
      projectLabel: entry.project_slug
        ? getProjectLabel(entry.project_slug) || entry.project_slug
        : null,
      dayLabel: shortDay(entry.local_date, timeZone),
      timeLabel: getLocalTimeLabel(entry.created_at, timeZone),
    }
  })

  const events = (eventRes.data || []).map((event) => ({
    id: event.id,
    href: '/life/review',
    title: event.title || '(Untitled event)',
    timeLabel: event.all_day
      ? 'All day'
      : event.start_time
        ? getLocalTimeLabel(event.start_time, timeZone)
        : '—',
    dayLabel: shortDay(event.local_date, timeZone),
  }))

  return {
    query,
    hasQuery,
    totalResults: tasks.length + entries.length + events.length,
    tasks,
    entries,
    events,
  }
}
