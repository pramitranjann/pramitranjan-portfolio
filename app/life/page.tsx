import { after } from 'next/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { MarkdownCard } from '@/components/life/MarkdownCard'
import { QuickAdd } from '@/components/life/QuickAdd'
import { VoiceCaptureControl } from '@/components/life/VoiceCaptureControl'
import { OWNER_ID } from '@/lib/life/constants'
import { getEntryPresentation } from '@/lib/life/entries'
import { isAdminSession } from '@/lib/admin-auth'
import { getProjectLabel } from '@/lib/life/projects'
import { getOwnerSettings } from '@/lib/life/settings'
import { generateMorningBrief } from '@/lib/life/synthesis'
import { getSupabaseAdmin } from '@/lib/life/supabase'
import { getTasks } from '@/lib/life/tasks'
import {
  getCurrentLocalClock,
  getCurrentLocalDate,
  getLocalTimeLabel,
  isMorningBriefWindow,
  localDateTimeToUtc,
} from '@/lib/life/time'
import type {
  CalendarEventRecord,
  EntryRecord,
  ReportRecord,
  TaskRecord,
} from '@/lib/life/types'

function shortDate(localDate: string, timeZone: string) {
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

function shortDay(localDate: string, timeZone: string) {
  const date = localDateTimeToUtc(localDate, timeZone, 12, 0)
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: 'numeric',
    month: 'short',
  }).formatToParts(date)
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  return `${lookup.day} ${lookup.month}`
}

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// ── Side cards (streams in via Suspense) ─────────────────────────────────────

async function CapturedTodayCard({
  localDate,
  timezone,
}: {
  localDate: string
  timezone: string
}) {
  const supabase = getSupabaseAdmin()
  const entriesResult = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', OWNER_ID)
    .eq('local_date', localDate)
    .order('created_at', { ascending: false })

  const entries = (entriesResult.data || []) as EntryRecord[]

  return (
    <div className="life-card life-captured-card">
      <div className="life-card-head">
        <h2>Captured today</h2>
        <Link href="/life/history" className="life-card-action">
          All entries →
        </Link>
      </div>
      {entries.length === 0 ? (
        <div className="life-empty">Nothing captured yet.</div>
      ) : (
        <ul className="life-capture-feed">
          {entries.map((entry) => {
            const presentation = getEntryPresentation(entry)
            const projectLabel = entry.project_slug
              ? getProjectLabel(entry.project_slug) || entry.project_slug
              : null
            return (
              <li className="life-capture-item" key={entry.id}>
                <span className="life-capture-time">{getLocalTimeLabel(entry.created_at, timezone)}</span>
                <div className="life-capture-body">
                  <div className="life-capture-meta">
                    <span className="life-entry-kind" style={{ color: presentation.color }}>
                      {presentation.kind}
                    </span>
                    {projectLabel ? <span className="life-tag">{projectLabel}</span> : null}
                  </div>
                  <p className="life-capture-text">{entry.content}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

async function TodaySideCards({
  localDate,
  timezone,
}: {
  localDate: string
  timezone: string
}) {
  const supabase = getSupabaseAdmin()

  // All data sources run in parallel — nothing sequential.
  const [eventsResult, reportsResult, taskRows] = await Promise.all([
    supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', OWNER_ID)
      .eq('local_date', localDate)
      .order('start_time', { ascending: true }),
    supabase
      .from('reports')
      .select('*')
      .eq('user_id', OWNER_ID)
      .eq('local_date', localDate)
      .order('created_at', { ascending: false }),
    getTasks({ status: 'active' }),
  ])

  const events = (eventsResult.data || []) as CalendarEventRecord[]
  const activeTasks = taskRows as TaskRecord[]
  const morningReport =
    ((reportsResult.data || []) as ReportRecord[]).find((r) => r.type === 'morning') || null
  const briefTime = morningReport ? getLocalTimeLabel(morningReport.created_at, timezone) : null
  const dueToday = activeTasks.filter((t) => t.due_local_date === localDate)
  const todayTasks = (dueToday.length ? dueToday : activeTasks).slice(0, 6)

  return (
    <>
      <div className="life-card life-morning-brief-card">
        <div className="life-card-head">
          <h2>Morning brief</h2>
          {briefTime ? <span className="eyebrow">{briefTime}</span> : null}
        </div>
        <div className="life-brief-body">
          {morningReport ? (
            <MarkdownCard content={morningReport.content} />
          ) : (
            <p>No brief yet today. It lands in the morning.</p>
          )}
        </div>
      </div>

      <div className="life-card life-today-tasks-card">
        <div className="life-card-head">
          <h2>Today&rsquo;s tasks</h2>
          <span className="count-pill">{todayTasks.length}</span>
        </div>
        {todayTasks.length === 0 ? (
          <div className="life-empty">Nothing queued.</div>
        ) : (
          <ul className="life-rows">
            {todayTasks.map((task) => {
              const isDone = task.status === 'done'
              const projectLabel = task.project_slug
                ? getProjectLabel(task.project_slug) || task.project_slug
                : 'General'
              const dueLabel =
                task.due_local_date === localDate
                  ? 'Today'
                  : task.due_local_date
                    ? shortDay(task.due_local_date, timezone)
                    : ''
              return (
                <li className="life-row" key={task.id}>
                  <form action={`/api/life/tasks/${task.id}`} method="post">
                    <input type="hidden" name="redirectTo" value="/life" />
                    <input type="hidden" name="status" value={isDone ? 'open' : 'done'} />
                    <button
                      type="submit"
                      className={`life-check${isDone ? ' is-done' : ''}`}
                      aria-label={isDone ? 'Reopen task' : 'Mark task done'}
                    >
                      ✓
                    </button>
                  </form>
                  <div className="life-row-body">
                    <span className={`life-row-title${isDone ? ' is-done' : ''}`}>{task.title}</span>
                    <span className="life-row-meta">
                      <span className={`pri-dot pri-${task.priority}`} />
                      {projectLabel}
                    </span>
                  </div>
                  {dueLabel ? <span className="life-row-aside">{dueLabel}</span> : <span />}
                </li>
              )
            })}
          </ul>
        )}
        <div className="life-card-foot">
          <Link href="/life/tasks">View all tasks →</Link>
        </div>
      </div>

      <div className="life-card life-today-schedule-card">
        <div className="life-card-head">
          <h2>Schedule</h2>
          <span className="count-pill">{events.length}</span>
        </div>
        {events.length === 0 ? (
          <div className="life-empty">No events.</div>
        ) : (
          <ul className="life-rows">
            {events.map((event) => (
              <li className="life-row" key={event.id} style={{ gridTemplateColumns: 'auto 1fr' }}>
                <span className="time-chip">
                  {event.all_day
                    ? 'All day'
                    : event.start_time
                      ? getLocalTimeLabel(event.start_time, timezone)
                      : '—'}
                </span>
                <span className="life-row-title">{event.title || '(Untitled event)'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function LifeTodayPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life')
  }

  const params = await searchParams
  const formError = params.error === 'content' ? 'Content is required.' : params.error || null

  // Settings are cached — this is a fast cache hit after the first request.
  const settings = await getOwnerSettings()
  const timezone = settings.timezone
  const localDate = getCurrentLocalDate(timezone)
  const hour = getCurrentLocalClock(timezone).hour
  const eyebrowDate = shortDate(localDate, timezone)

  // The morning brief has no cron of its own (Vercel Hobby allows one cron,
  // already used by the nightly EOD job). Instead, when the app is opened
  // during the morning window we generate it in the background AFTER the
  // response is sent — `after()` is backed by Vercel's waitUntil, so it never
  // delays the page render. generateMorningBrief self-gates (it bails if a
  // brief already exists or the task threshold isn't met), so loading Today
  // repeatedly in the morning is a cheap no-op once the brief has run.
  if (isMorningBriefWindow(timezone)) {
    after(async () => {
      try {
        await generateMorningBrief({ localDate })
      } catch (error) {
        console.error('Background morning brief generation failed', error)
      }
    })
  }

  const textareaId = 'life-entry-textarea'
  const sourceInputId = 'life-entry-source'

  return (
    <div className="life-today">
      <form action="/life/search" method="get" className="life-today-search" role="search">
        <span aria-hidden="true">⌕</span>
        <input name="q" type="search" placeholder="Search…" aria-label="Search life" />
      </form>
      <p className="eyebrow life-today-eyebrow">
        Today · <b>{eyebrowDate}</b>
      </p>
      <h1 className="life-greeting">{greetingForHour(hour)}, Pramit.</h1>

      <div className="life-today-grid">
        {/* Left column: no DB dependencies — paints immediately */}
        <section className="life-capture">
          <p className="life-greeting-sub">
            What&apos;s on your mind? Speak it or type it. I&apos;ll sort the tasks, notes, and
            events out for you.
          </p>

          <form action="/api/life/entries" method="post">
            <input id={sourceInputId} name="source" type="hidden" defaultValue="text" />
            <div className="life-composer-outer">
              <div className="life-composer">
                <textarea
                  className="life-composer-input"
                  id={textareaId}
                  name="content"
                  placeholder="Brain-dump anything — book flights, crit went well, gym at 4…"
                />
                <div className="life-composer-bar">
                  <VoiceCaptureControl
                    sourceInputId={sourceInputId}
                    textareaId={textareaId}
                    liveTranscriptId="life-live-transcript"
                  />
                  <span className="spacer" />
                  <button className="life-btn ghost life-clear" type="reset">
                    Clear
                  </button>
                  <button className="life-btn primary life-save" type="submit">
                    Save entry
                  </button>
                </div>
              </div>
              <button className="life-save-below" type="submit">
                Save entry
              </button>
            </div>
          </form>
          <div id="life-live-transcript" className="life-live-transcript" aria-live="polite" />
          {formError ? <p className="error-text">{formError}</p> : null}

          <QuickAdd redirectTo="/life" localDate={localDate} textareaId={textareaId} />

          <section className="life-capture-stream">
            <CapturedTodayCard localDate={localDate} timezone={timezone} />
          </section>

        </section>

        <aside className="life-side">
          <TodaySideCards localDate={localDate} timezone={timezone} />
        </aside>
      </div>
    </div>
  )
}
