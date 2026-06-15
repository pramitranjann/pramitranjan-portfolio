import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { MarkdownCard } from '@/components/life/MarkdownCard'
import { QuickAdd } from '@/components/life/QuickAdd'
import { VoiceCaptureControl } from '@/components/life/VoiceCaptureControl'
import { OWNER_ID } from '@/lib/life/constants'
import { isAdminSession } from '@/lib/admin-auth'
import { getHabitsForDate } from '@/lib/life/habits'
import { getProjectLabel } from '@/lib/life/projects'
import { getOwnerSettings } from '@/lib/life/settings'
import { getSupabaseAdmin } from '@/lib/life/supabase'
import { getTasks } from '@/lib/life/tasks'
import {
  getCurrentLocalClock,
  getCurrentLocalDate,
  getLocalTimeLabel,
  localDateTimeToUtc,
} from '@/lib/life/time'
import type {
  CalendarEventRecord,
  HabitWithStatus,
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

async function TodayCards({
  localDate,
  timezone,
}: {
  localDate: string
  timezone: string
}) {
  const supabase = getSupabaseAdmin()

  // All four data sources run in parallel — nothing sequential.
  const [eventsResult, reportsResult, taskRows, habits] = await Promise.all([
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
    getHabitsForDate(localDate).catch(() => [] as HabitWithStatus[]),
  ])

  const events = (eventsResult.data || []) as CalendarEventRecord[]
  const activeTasks = taskRows as TaskRecord[]
  const morningReport =
    ((reportsResult.data || []) as ReportRecord[]).find((r) => r.type === 'morning') || null
  const briefTime = morningReport ? getLocalTimeLabel(morningReport.created_at, timezone) : null
  const dueToday = activeTasks.filter((t) => t.due_local_date === localDate)
  const todayTasks = (dueToday.length ? dueToday : activeTasks).slice(0, 6)
  const habitsDone = habits.filter((h) => h.done).length

  return (
    <>
      <div className="life-card">
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

      <div className="life-card">
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

      <div className="life-card">
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

      <div className="life-card">
        <div className="life-card-head">
          <h2>Habits</h2>
          {habits.length > 0 ? (
            <span className="count-pill">
              {habitsDone}/{habits.length}
            </span>
          ) : null}
        </div>
        {habits.length === 0 ? (
          <div className="life-empty">No habits yet. Add one from Quick add.</div>
        ) : (
          <ul className="life-rows">
            {habits.map((habit) => (
              <li className="life-row" key={habit.id} style={{ gridTemplateColumns: 'auto 1fr' }}>
                <form action={`/api/life/habits/${habit.id}`} method="post">
                  <input type="hidden" name="redirectTo" value="/life" />
                  <input type="hidden" name="localDate" value={localDate} />
                  <button
                    type="submit"
                    className={`life-check${habit.done ? ' is-done' : ''}`}
                    aria-label={habit.done ? 'Mark habit not done' : 'Mark habit done'}
                  >
                    ✓
                  </button>
                </form>
                <span className={`life-row-title${habit.done ? ' is-done' : ''}`}>{habit.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

function CardsSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="life-card life-card-skeleton">
          <div className="life-card-head">
            <div className="skeleton-line skeleton-title" />
          </div>
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-short" />
          <div className="skeleton-line" />
        </div>
      ))}
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

  const textareaId = 'life-entry-textarea'
  const sourceInputId = 'life-entry-source'

  return (
    <div className="life-today">
      {/* Left column: no DB dependencies — paints immediately */}
      <section className="life-capture">
        <p className="eyebrow">
          Today · <b>{eyebrowDate}</b>
        </p>
        <h1 className="life-greeting">{greetingForHour(hour)}, Pramit.</h1>

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
      </section>

      {/* Right column: streams in while the left column is already interactive */}
      <aside className="life-side">
        <Suspense fallback={<CardsSkeleton />}>
          <TodayCards localDate={localDate} timezone={timezone} />
        </Suspense>
      </aside>
    </div>
  )
}
