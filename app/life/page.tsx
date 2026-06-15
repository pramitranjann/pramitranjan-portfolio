import Link from 'next/link'
import { redirect } from 'next/navigation'

import { MarkdownCard } from '@/components/life/MarkdownCard'
import { QuickAdd } from '@/components/life/QuickAdd'
import { VoiceCaptureControl } from '@/components/life/VoiceCaptureControl'
import { OWNER_ID } from '@/lib/life/constants'
import { isAdminSession } from '@/lib/admin-auth'
import { syncCalendarEvents } from '@/lib/life/calendar'
import { getHabitsForDate } from '@/lib/life/habits'
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
  HabitWithStatus,
  ReportRecord,
  TaskRecord,
} from '@/lib/life/types'

function shortDate(localDate: string, timeZone: string) {
  // "Sun 15 Jun"
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
  // "15 Jun"
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

  let timezone = 'UTC'
  let localDate = ''
  let hour = 9
  let events: CalendarEventRecord[] = []
  let morningReport: ReportRecord | null = null
  let activeTasks: TaskRecord[] = []
  let calendarError: string | null = null
  let loadError: string | null = null

  try {
    const settings = await getOwnerSettings()
    timezone = settings.timezone
    localDate = getCurrentLocalDate(timezone)
    hour = getCurrentLocalClock(timezone).hour

    try {
      await syncCalendarEvents(localDate)
    } catch (error) {
      console.error('Life calendar sync failed during page load', error)
      calendarError = 'Calendar sync is unavailable right now.'
    }

    try {
      const supabase = getSupabaseAdmin()

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

      if (eventsResult.error) throw eventsResult.error
      if (reportsResult.error) throw reportsResult.error

      events = (eventsResult.data || []) as CalendarEventRecord[]
      activeTasks = taskRows as TaskRecord[]
      morningReport =
        ((reportsResult.data || []) as ReportRecord[]).find((report) => report.type === 'morning') || null

      if (!morningReport && isMorningBriefWindow(timezone)) {
        try {
          const morningResult = await generateMorningBrief({ localDate })
          morningReport = (morningResult.report as ReportRecord | undefined) || null
        } catch (error) {
          console.error('Life morning brief generation failed during page load', error)
        }
      }
    } catch (error) {
      loadError = error instanceof Error ? error.message : 'Failed to load today.'
    }
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Failed to load today.'
  }

  let habits: HabitWithStatus[] = []
  if (localDate) {
    try {
      habits = await getHabitsForDate(localDate)
    } catch (error) {
      // Habits table may not be migrated yet — degrade gracefully.
      console.error('Life habits load failed', error)
    }
  }

  const eyebrowDate = localDate ? shortDate(localDate, timezone) : 'Today'
  const habitsDone = habits.filter((habit) => habit.done).length
  const dueToday = activeTasks.filter((task) => task.due_local_date === localDate)
  const todayTasks = (dueToday.length ? dueToday : activeTasks).slice(0, 6)
  const briefTime = morningReport ? getLocalTimeLabel(morningReport.created_at, timezone) : null

  const textareaId = 'life-entry-textarea'
  const sourceInputId = 'life-entry-source'

  return (
    <div className="life-today">
      <section className="life-capture">
        <p className="eyebrow">
          Today · <b>{eyebrowDate}</b>
        </p>
        <h1 className=”life-greeting”>{greetingForHour(hour)}, Pramit.</h1>

        <form action=”/api/life/entries” method=”post”>
          <input id={sourceInputId} name=”source” type=”hidden” defaultValue=”text” />
          <div className=”life-composer-outer”>
            <div className=”life-composer”>
              <textarea
                className=”life-composer-input”
                id={textareaId}
                name=”content”
                placeholder=”Brain-dump anything — “book flights, crit went well, gym at 4…””
              />
              <div className=”life-composer-bar”>
                <VoiceCaptureControl
                  sourceInputId={sourceInputId}
                  textareaId={textareaId}
                  liveTranscriptId=”life-live-transcript”
                />
                <span className=”spacer” />
                <button className=”life-btn ghost life-clear” type=”reset”>
                  Clear
                </button>
                <button className=”life-btn primary life-save” type=”submit”>
                  Save entry
                </button>
              </div>
            </div>
            {/* Phone-only: save button below the textarea */}
            <button className=”life-save-below” type=”submit”>
              Save entry
            </button>
          </div>
        </form>
        <div id="life-live-transcript" className="life-live-transcript" aria-live="polite" />
        {formError ? <p className="error-text">{formError}</p> : null}
        {loadError ? <p className="error-text">{loadError}</p> : null}

        <QuickAdd redirectTo="/life" localDate={localDate} textareaId={textareaId} />
      </section>

      <aside className="life-side">
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
          {calendarError ? <div className="life-empty">{calendarError}</div> : null}
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
      </aside>
    </div>
  )
}
