import { redirect } from 'next/navigation'

import { MarkdownCard } from '@/components/life/MarkdownCard'
import { VoiceCaptureControl } from '@/components/life/VoiceCaptureControl'
import { OWNER_ID } from '@/lib/life/constants'
import { isAdminSession } from '@/lib/admin-auth'
import { getOwnerSettings } from '@/lib/life/settings'
import { getSupabaseAdmin } from '@/lib/life/supabase'
import { getCurrentLocalDate, getDisplayDate, getLocalTimeLabel } from '@/lib/life/time'
import type { CalendarEventRecord, EntryRecord, ReportRecord } from '@/lib/life/types'

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
  let entries: EntryRecord[] = []
  let events: CalendarEventRecord[] = []
  let morningReport: ReportRecord | null = null
  let loadError: string | null = null

  try {
    const settings = await getOwnerSettings()
    timezone = settings.timezone
    localDate = getCurrentLocalDate(timezone)
    const supabase = getSupabaseAdmin()

    const [entriesResult, eventsResult, reportsResult] = await Promise.all([
      supabase
        .from('entries')
        .select('*')
        .eq('user_id', OWNER_ID)
        .eq('local_date', localDate)
        .order('created_at', { ascending: false }),
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
    ])

    if (entriesResult.error) throw entriesResult.error
    if (eventsResult.error) throw eventsResult.error
    if (reportsResult.error) throw reportsResult.error

    entries = (entriesResult.data || []) as EntryRecord[]
    events = (eventsResult.data || []) as CalendarEventRecord[]
    morningReport = ((reportsResult.data || []) as ReportRecord[]).find((report) => report.type === 'morning') || null
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Failed to load today.'
  }

  const displayDate = localDate ? getDisplayDate(localDate, timezone) : 'Today'
  const textareaId = 'life-entry-textarea'
  const sourceInputId = 'life-entry-source'

  return (
    <div className="page-grid">
      <section className="hero-card">
        <p className="eyebrow">Today</p>
        <h1>{displayDate}</h1>
        <p className="hero-copy">
          Capture the day in fragments. The app stores each note under the owner timezone,
          then turns the full thread into an end-of-day brief.
        </p>

        <form action="/api/life/entries" className="capture-stack" method="post">
          <input id={sourceInputId} name="source" type="hidden" defaultValue="text" />
          <VoiceCaptureControl sourceInputId={sourceInputId} textareaId={textareaId} />
          <textarea
            className="draft-area"
            id={textareaId}
            name="content"
            rows={6}
            placeholder="Type or dictate the raw note here."
          />
          <button className="primary-button" type="submit">
            Save entry
          </button>
          {formError ? <p className="error-text">{formError}</p> : null}
          {loadError ? <p className="error-text">{loadError}</p> : null}
        </form>
      </section>

      {morningReport ? (
        <section className="panel-card">
          <details>
            <summary className="summary-toggle">Morning brief</summary>
            <MarkdownCard content={morningReport.content} />
          </details>
        </section>
      ) : null}

      <section className="panel-card">
        <div className="section-head">
          <h2>Scheduled today</h2>
          <span className="count-pill">{events.length}</span>
        </div>
        {events.length === 0 ? (
          <p className="muted-text">No synced calendar events yet.</p>
        ) : (
          <ul className="timeline-list">
            {events.map((event) => (
              <li className="timeline-item" key={event.id}>
                <div>
                  <strong>{event.title || '(Untitled event)'}</strong>
                  <p className="muted-text">
                    {event.all_day
                      ? 'All day'
                      : `${event.start_time ? getLocalTimeLabel(event.start_time, timezone) : 'Unknown'} to ${event.end_time ? getLocalTimeLabel(event.end_time, timezone) : 'Unknown'}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel-card">
        <div className="section-head">
          <h2>Today&apos;s entries</h2>
          <span className="count-pill">{entries.length}</span>
        </div>
        {entries.length === 0 ? <p className="muted-text">No entries yet.</p> : null}
        <ul className="timeline-list">
          {entries.map((entry) => (
            <li className="timeline-item" key={entry.id}>
              <div className="timeline-meta">
                <span>{getLocalTimeLabel(entry.created_at, timezone)}</span>
                <span>{entry.source}</span>
              </div>
              <p>{entry.content}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
