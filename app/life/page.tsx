import { redirect } from 'next/navigation'

import { MarkdownCard } from '@/components/life/MarkdownCard'
import { VoiceCaptureControl } from '@/components/life/VoiceCaptureControl'
import { OWNER_ID } from '@/lib/life/constants'
import { isAdminSession } from '@/lib/admin-auth'
import { syncCalendarEvents } from '@/lib/life/calendar'
import { getProjectLabel, LIFE_PROJECTS } from '@/lib/life/projects'
import { getOwnerSettings } from '@/lib/life/settings'
import { generateMorningBrief } from '@/lib/life/synthesis'
import { getSupabaseAdmin } from '@/lib/life/supabase'
import { getTasks } from '@/lib/life/tasks'
import { getCurrentLocalDate, getDisplayDate, getLocalTimeLabel, isMorningBriefWindow } from '@/lib/life/time'
import type { CalendarEventRecord, ReportRecord, TaskRecord } from '@/lib/life/types'

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
  let events: CalendarEventRecord[] = []
  let morningReport: ReportRecord | null = null
  let activeTasks: TaskRecord[] = []
  let calendarError: string | null = null
  let loadError: string | null = null

  try {
    const settings = await getOwnerSettings()
    timezone = settings.timezone
    localDate = getCurrentLocalDate(timezone)

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
      activeTasks = taskRows.slice(0, 6)
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

  const displayDate = localDate ? getDisplayDate(localDate, timezone) : 'Today'
  const textareaId = 'life-entry-textarea'
  const sourceInputId = 'life-entry-source'

  return (
    <div className="life-home-grid">
      <section className="hero-card life-capture-card">
        <div className="life-page-head">
          <p className="eyebrow">Today · {displayDate}</p>
        </div>

        <form action="/api/life/entries" className="capture-stack life-capture-stack" method="post">
          <input id={sourceInputId} name="source" type="hidden" defaultValue="text" />
          <VoiceCaptureControl
            sourceInputId={sourceInputId}
            textareaId={textareaId}
            liveTranscriptId="life-live-transcript"
          />
          <div id="life-live-transcript" className="life-live-transcript" aria-live="polite" />
          <textarea
            className="draft-area life-entry-area"
            id={textareaId}
            name="content"
            rows={6}
            placeholder="Capture."
          />
          <div className="life-entry-controls">
            <label className="field compact-field">
              <span>Project</span>
              <select className="text-input" defaultValue="" name="projectSlug">
                <option value="">Auto</option>
                {LIFE_PROJECTS.map((project) => (
                  <option key={project.slug} value={project.slug}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary-button" type="submit">
              Save
            </button>
          </div>
          {formError ? <p className="error-text">{formError}</p> : null}
          {loadError ? <p className="error-text">{loadError}</p> : null}
        </form>
      </section>

      <aside className="life-home-sidebar">
        {morningReport ? (
          <section className="panel-card life-brief-card">
            <div className="section-head">
              <h2>AM brief</h2>
            </div>
            <MarkdownCard content={morningReport.content} />
          </section>
        ) : null}

        <section className="panel-card life-plan-card">
          <div className="section-head">
            <h2>Tasks</h2>
            <span className="count-pill">{activeTasks.length}</span>
          </div>
          {activeTasks.length === 0 ? <p className="muted-text">Clear.</p> : null}
          <ul className="timeline-list life-task-strip">
            {activeTasks.map((task) => (
              <li className="timeline-item" key={task.id}>
                <strong>{task.title}</strong>
                <p className="muted-text">
                  {task.project_slug ? `${getProjectLabel(task.project_slug) || task.project_slug}` : 'General'}
                  {task.due_local_date ? ` • ${task.due_local_date}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel-card life-calendar-card">
          <div className="section-head">
            <h2>Cal</h2>
            <span className="count-pill">{events.length}</span>
          </div>
          {events.length === 0 ? (
            <p className="muted-text">No events.</p>
          ) : (
            <ul className="timeline-list">
              {events.map((event) => (
                <li className="timeline-item" key={event.id}>
                  <strong>{event.title || '(Untitled event)'}</strong>
                  <p className="muted-text">
                    {event.all_day
                      ? 'All day'
                      : `${event.start_time ? getLocalTimeLabel(event.start_time, timezone) : 'Unknown'} to ${event.end_time ? getLocalTimeLabel(event.end_time, timezone) : 'Unknown'}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {calendarError ? <p className="error-text">{calendarError}</p> : null}
        </section>
      </aside>
    </div>
  )
}
