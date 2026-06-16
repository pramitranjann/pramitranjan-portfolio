import Link from 'next/link'
import { redirect } from 'next/navigation'

import { isAdminSession } from '@/lib/admin-auth'
import { OWNER_ID } from '@/lib/life/constants'
import { getEntryPresentation } from '@/lib/life/entries'
import { getProjectLabel } from '@/lib/life/projects'
import { getOwnerSettings } from '@/lib/life/settings'
import { getSupabaseAdmin } from '@/lib/life/supabase'
import { getLocalTimeLabel, localDateTimeToUtc } from '@/lib/life/time'
import type { CalendarEventRecord, EntryRecord, TaskRecord } from '@/lib/life/types'

function shortDay(localDate: string, timeZone: string) {
  const date = localDateTimeToUtc(localDate, timeZone, 12, 0)
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).formatToParts(date)
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  return `${lookup.weekday} ${lookup.day} ${lookup.month}`
}

// PostgREST `ilike` treats % and , specially inside the filter string; strip
// them so a raw query can't break the filter grammar.
function sanitize(value: string) {
  return value.replace(/[%,]/g, ' ').trim()
}

export default async function LifeSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/search')
  }

  const params = await searchParams
  const rawQuery = (params.q || '').trim()
  const term = sanitize(rawQuery)
  const settings = await getOwnerSettings()
  const tz = settings.timezone

  let tasks: TaskRecord[] = []
  let entries: EntryRecord[] = []
  let events: CalendarEventRecord[] = []

  if (term.length >= 2) {
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
        .limit(40)
        .returns<TaskRecord[]>(),
      supabase
        .from('entries')
        .select('*')
        .eq('user_id', OWNER_ID)
        .ilike('content', like)
        .order('created_at', { ascending: false })
        .limit(40)
        .returns<EntryRecord[]>(),
      supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', OWNER_ID)
        .ilike('title', like)
        .order('start_time', { ascending: false })
        .limit(40)
        .returns<CalendarEventRecord[]>(),
    ])
    tasks = taskRes.data || []
    entries = entryRes.data || []
    events = eventRes.data || []
  }

  const totalResults = tasks.length + entries.length + events.length
  const hasQuery = rawQuery.length > 0

  return (
    <div className="life-search-shell">
      <div className="life-page-head">
        <div>
          <p className="eyebrow">Search</p>
          <h1>{hasQuery ? `“${rawQuery}”` : 'Search everything'}</h1>
        </div>
        {hasQuery ? <span className="life-week-range">{totalResults} results</span> : null}
      </div>

      <form action="/life/search" method="get" className="life-search-page-form">
        <input
          type="search"
          name="q"
          defaultValue={rawQuery}
          autoFocus
          placeholder="Search tasks, notes, and events…"
          className="text-input"
        />
        <button type="submit" className="primary-button">
          Search
        </button>
      </form>

      {!hasQuery ? (
        <p className="muted-text">Find anything across tasks, captured notes, and calendar events.</p>
      ) : totalResults === 0 ? (
        <div className="life-empty">No matches for “{rawQuery}”.</div>
      ) : (
        <div className="life-search-results">
          {tasks.length > 0 ? (
            <section className="life-card">
              <div className="life-card-head">
                <h2>Tasks</h2>
                <span className="count-pill">{tasks.length}</span>
              </div>
              <ul className="life-rows">
                {tasks.map((task) => {
                  const projectLabel = task.project_slug
                    ? getProjectLabel(task.project_slug) || task.project_slug
                    : 'General'
                  return (
                    <li className="life-row" key={task.id} style={{ gridTemplateColumns: '1fr auto' }}>
                      <Link href="/life/tasks" className="life-row-body">
                        <span className={`life-row-title${task.status === 'done' ? ' is-done' : ''}`}>
                          {task.title}
                        </span>
                        <span className="life-row-meta">
                          <span className={`pri-dot pri-${task.priority}`} />
                          {projectLabel}
                        </span>
                      </Link>
                      {task.due_local_date ? (
                        <span className="life-row-aside">{shortDay(task.due_local_date, tz)}</span>
                      ) : (
                        <span />
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : null}

          {entries.length > 0 ? (
            <section className="life-card">
              <div className="life-card-head">
                <h2>Entries</h2>
                <span className="count-pill">{entries.length}</span>
              </div>
              <ul className="life-rows">
                {entries.map((entry) => {
                  const presentation = getEntryPresentation(entry)
                  const projectLabel = entry.project_slug
                    ? getProjectLabel(entry.project_slug) || entry.project_slug
                    : null
                  return (
                    <li className="life-row life-entry-row" key={entry.id} style={{ gridTemplateColumns: '1fr auto' }}>
                      <div className="life-row-body">
                        <span className="life-entry-text">{entry.content}</span>
                        <span className="life-row-meta">
                          <span className="life-entry-kind" style={{ color: presentation.color }}>
                            {presentation.kind}
                          </span>
                          <span>{shortDay(entry.local_date, tz)}</span>
                          {projectLabel ? <span className="life-tag">{projectLabel}</span> : null}
                        </span>
                      </div>
                      <span className="life-row-aside">{getLocalTimeLabel(entry.created_at, tz)}</span>
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : null}

          {events.length > 0 ? (
            <section className="life-card">
              <div className="life-card-head">
                <h2>Events</h2>
                <span className="count-pill">{events.length}</span>
              </div>
              <ul className="life-rows">
                {events.map((event) => (
                  <li className="life-row" key={event.id} style={{ gridTemplateColumns: 'auto 1fr auto' }}>
                    <span className="time-chip">
                      {event.all_day
                        ? 'All day'
                        : event.start_time
                          ? getLocalTimeLabel(event.start_time, tz)
                          : '—'}
                    </span>
                    <span className="life-row-title">{event.title || '(Untitled event)'}</span>
                    <span className="life-row-aside">{shortDay(event.local_date, tz)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  )
}
