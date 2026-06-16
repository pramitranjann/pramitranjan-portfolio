'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { useViewportMode } from '@/hooks/useViewportMode'
import { fetchJson } from '@/lib/life/client'
import { addDays, getLocalTimeLabel, getTimeParts, getWeekStart, localDateTimeToUtc } from '@/lib/life/time'
import type { CalendarEventRecord, TaskRecord } from '@/lib/life/types'

const DAY_START_HOUR = 7
const DAY_END_HOUR = 22
const DAY_TOTAL_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60

function getMinutesFromMidnight(utcString: string, tz: string): number {
  const parts = getTimeParts(new Date(utcString), tz)
  return parts.hour * 60 + parts.minute
}

function eventTopPct(startMin: number): number {
  return Math.max(0, ((startMin - DAY_START_HOUR * 60) / DAY_TOTAL_MINUTES) * 100)
}

function eventHeightPct(startMin: number, endMin: number): number {
  const clampedStart = Math.max(startMin, DAY_START_HOUR * 60)
  const clampedEnd = Math.min(endMin, DAY_END_HOUR * 60)
  return Math.max(2, ((clampedEnd - clampedStart) / DAY_TOTAL_MINUTES) * 100)
}

interface WeekResponse {
  start: string
  end: string
  timezone: string
  events: CalendarEventRecord[]
  tasks: TaskRecord[]
}

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function range(start: string, days: number): string[] {
  return Array.from({ length: days }, (_, i) => addDays(start, i))
}

function isoWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  const dayNum = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - dayNum + 3)
  const firstThursday = date.getTime()
  date.setUTCMonth(0, 1)
  if (date.getUTCDay() !== 4) {
    date.setUTCMonth(0, 1 + ((4 - date.getUTCDay() + 7) % 7))
  }
  return 1 + Math.round((firstThursday - date.getTime()) / (7 * 24 * 3600 * 1000))
}

function dayMonth(localDate: string, timeZone: string) {
  const date = localDateTimeToUtc(localDate, timeZone, 12, 0)
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: 'numeric',
    month: 'short',
  }).formatToParts(date)
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  return { day: lookup.day, month: lookup.month }
}

function formatRange(start: string, end: string, timeZone: string) {
  const s = dayMonth(start, timeZone)
  const e = dayMonth(end, timeZone)
  return s.month === e.month
    ? `${s.day} – ${e.day} ${e.month}`
    : `${s.day} ${s.month} – ${e.day} ${e.month}`
}

export function WeekClient({
  initialStart,
  today,
  timezone,
}: {
  initialStart: string
  today: string
  timezone: string
}) {
  const viewport = useViewportMode()
  const [weekStart, setWeekStart] = useState(initialStart)
  const [data, setData] = useState<WeekResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDate, setExpandedDate] = useState<string | null>(null)
  const [nowMinutes, setNowMinutes] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  // Inline event composer: which {date, hour} slot is being filled, plus its
  // editable fields and save state.
  const [draft, setDraft] = useState<{ date: string; hour: number } | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftStart, setDraftStart] = useState('')
  const [draftEnd, setDraftEnd] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const todayRef = useRef<HTMLDivElement | null>(null)
  // Auto-scroll-to-today must happen at most ONCE, on first load of the current
  // week. Re-running it on every `data` refresh yanked the scroll position out
  // from under the user (it fired the moment the async week payload arrived),
  // which read as "the arrows / header jump while I'm scrolling".
  const didInitialScrollRef = useRef(false)

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])
  const dayList = useMemo(() => range(weekStart, 7), [weekStart])
  // The Monday of the week that actually contains `today`.
  const currentWeekStart = useMemo(() => getWeekStart(today), [today])

  // Relative heading: "This week" only when you're on the current week; otherwise
  // "Last week" / "Next week", and "Week NN" for anything further out. (Previously
  // the <h1> was hardcoded to "This week" no matter which week you paged to.)
  const weekHeading = useMemo(() => {
    if (weekStart === currentWeekStart) return 'This week'
    if (weekStart === addDays(currentWeekStart, -7)) return 'Last week'
    if (weekStart === addDays(currentWeekStart, 7)) return 'Next week'
    return `Week ${isoWeek(weekStart)}`
  }, [weekStart, currentWeekStart])

  const isCurrentWeek = weekStart === currentWeekStart

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchJson<WeekResponse>(`/api/life/week?start=${weekStart}&end=${weekEnd}`)
      .then((payload) => {
        if (!cancelled) setData(payload)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load week.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [weekStart, weekEnd, refreshKey])

  // Reset the one-shot scroll flag whenever the user pages to a different week,
  // so navigating away and back to the current week scrolls to today again.
  useEffect(() => {
    didInitialScrollRef.current = false
    setExpandedDate(null)
    setDraft(null)
  }, [weekStart])

  function openDraft(date: string, hour: number) {
    setSaveError(null)
    setDraftTitle('')
    setDraftStart(`${String(hour).padStart(2, '0')}:00`)
    setDraftEnd(`${String(Math.min(hour + 1, 23)).padStart(2, '0')}:00`)
    setDraft({ date, hour })
  }

  async function saveDraft() {
    if (!draft) return
    const title = draftTitle.trim()
    if (!title) {
      setSaveError('Title required.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await fetchJson('/api/life/calendar/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title,
          localDate: draft.date,
          startTime: draftStart || null,
          endTime: draftEnd || null,
        }),
      })
      setDraft(null)
      setRefreshKey((key) => key + 1) // re-pull the week so the new event appears
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not create event.')
    } finally {
      setSaving(false)
    }
  }

  // Live clock for current-time indicator (updates every minute).
  useEffect(() => {
    function tick() {
      const now = new Date()
      setNowMinutes(now.getHours() * 60 + now.getMinutes())
    }
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (viewport !== 'phone') return
    if (didInitialScrollRef.current) return
    if (!isCurrentWeek) return // never auto-scroll on weeks that don't contain today
    if (!data) return
    didInitialScrollRef.current = true
    // 'auto' (instant) — a smooth animation here competes with the user's own
    // scrolling. scroll-margin-top in CSS keeps the row clear of the sticky header.
    todayRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' })
  }, [data, isCurrentWeek, viewport])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEventRecord[]>()
    for (const ev of data?.events || []) {
      const list = map.get(ev.local_date) || []
      list.push(ev)
      map.set(ev.local_date, list)
    }
    return map
  }, [data])

  const tasksByDueDate = useMemo(() => {
    const map = new Map<string, TaskRecord[]>()
    for (const task of data?.tasks || []) {
      if (!task.due_local_date) continue
      const list = map.get(task.due_local_date) || []
      list.push(task)
      map.set(task.due_local_date, list)
    }
    return map
  }, [data])

  const tz = data?.timezone || timezone
  const hourRows = useMemo(
    () =>
      Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => {
        const h = DAY_START_HOUR + i
        return {
          hour: h,
          label: h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`,
        }
      }),
    [],
  )

  const desktopWeek = (
    <div className="life-week-desktop">
      <div className="life-week-desktop-head">
        <div className="life-week-corner" />
        {dayList.map((date, index) => {
          const isToday = date === today
          const { day } = dayMonth(date, tz)
          return (
            <div
              key={date}
              className={`life-week-col-head${isToday ? ' is-today' : ''}`}
            >
              <div className="life-week-col-weekday">{WEEKDAY_NAMES[index % 7]}</div>
              <div className="life-week-col-date">{day}</div>
            </div>
          )
        })}
      </div>

      <div className="life-week-allday-row">
        <div className="life-week-allday-label">All-day</div>
        {dayList.map((date) => {
          const allDayEvents = (eventsByDate.get(date) || []).filter((event) => event.all_day)
          return (
            <div
              key={`${date}-all-day`}
              className={`life-week-allday-cell${date === today ? ' is-today' : ''}`}
            >
              {allDayEvents.map((event) => (
                <span key={event.id} className="life-week-allday-badge">
                  {event.title || '(Untitled)'}
                </span>
              ))}
            </div>
          )
        })}
      </div>

      <div className="life-week-timeline">
        <div className="life-week-hour-rail">
          {hourRows.map((row, index) => (
            <span
              key={row.hour}
              className="life-week-hour-label"
              style={{ top: `${(index / hourRows.length) * 100}%` }}
            >
              {row.label}
            </span>
          ))}
        </div>

        {dayList.map((date) => {
          const isToday = date === today
          const timedEvents = (eventsByDate.get(date) || []).filter((event) => !event.all_day && event.start_time)
          const nowTop = isToday && nowMinutes !== null ? eventTopPct(nowMinutes) : null

          return (
            <div key={`${date}-timeline`} className={`life-week-day-col${isToday ? ' is-today' : ''}`}>
              {hourRows.map((row) => (
                <div key={`${date}-${row.hour}`} className="life-week-hour-line" />
              ))}

              {timedEvents.map((event) => {
                const startMin = getMinutesFromMidnight(event.start_time!, tz)
                const endMin = event.end_time
                  ? getMinutesFromMidnight(event.end_time, tz)
                  : startMin + 60
                const top = eventTopPct(startMin)
                const height = eventHeightPct(startMin, endMin)

                return (
                  <div
                    key={event.id}
                    className="life-week-event-card"
                    style={{ top: `${top}%`, height: `${height}%` }}
                  >
                    <div className="life-week-event-time">{getLocalTimeLabel(event.start_time!, tz)}</div>
                    <div className="life-week-event-title">{event.title || '(Untitled)'}</div>
                  </div>
                )
              })}

              {nowTop !== null ? (
                <div className="life-week-now-line" style={{ top: `${nowTop}%` }}>
                  <span className="life-week-now-dot" />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="life-week-shell">
      <div className="life-page-head">
        <div>
          <p className="eyebrow">Week {isoWeek(weekStart)}</p>
          <h1>{weekHeading}</h1>
        </div>
        <div className="life-week-toolbar">
          <span className="life-week-range">{formatRange(weekStart, weekEnd, tz)}</span>
          <button
            type="button"
            className="life-icon-btn"
            onClick={() => setWeekStart((current) => addDays(current, -7))}
            aria-label="Previous week"
          >
            ←
          </button>
          <button
            type="button"
            className="life-btn ghost"
            onClick={() => setWeekStart(getWeekStart(today))}
            disabled={isCurrentWeek}
          >
            Today
          </button>
          <button
            type="button"
            className="life-icon-btn"
            onClick={() => setWeekStart((current) => addDays(current, 7))}
            aria-label="Next week"
          >
            →
          </button>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {loading && !data ? <p className="muted-text">Loading week…</p> : null}

      {viewport === 'phone' ? (
        <div className="life-week-grid">
        {dayList.map((date, index) => {
          const isToday = date === today
          const isPast = date < today
          const isExpanded = expandedDate === date
          const dayNum = date.slice(8).replace(/^0/, '')
          const cellEvents = eventsByDate.get(date) || []
          const cellTasks = tasksByDueDate.get(date) || []
          const isEmpty = cellEvents.length === 0 && cellTasks.length === 0
          const timedEvents = cellEvents.filter((e) => !e.all_day && e.start_time)
          const allDayEvents = cellEvents.filter((e) => e.all_day)

          const nowTop =
            isToday && nowMinutes !== null
              ? eventTopPct(nowMinutes)
              : null

          return (
            <div
              key={date}
              ref={isToday ? todayRef : undefined}
              className={[
                'life-day-cell',
                isToday ? 'life-day-today' : '',
                isPast ? 'life-day-past' : '',
                isExpanded ? 'life-day-expanded' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <button
                type="button"
                className="life-day-head life-day-head-btn"
                onClick={() => setExpandedDate(isExpanded ? null : date)}
                aria-expanded={isExpanded}
                aria-label={`${WEEKDAY_NAMES[index % 7]} ${dayNum} — ${isExpanded ? 'collapse' : 'expand'}`}
              >
                <span className="life-day-weekday">{WEEKDAY_NAMES[index % 7]}</span>
                <span className="life-day-date">{dayNum}</span>
                {!isExpanded && cellEvents.length > 0 && (
                  <span className="life-day-dot-row">
                    {cellEvents.slice(0, 3).map((e) => (
                      <span key={e.id} className="life-day-dot" />
                    ))}
                  </span>
                )}
              </button>

              {isExpanded ? (
                <div className="life-day-timeline">
                  {allDayEvents.length > 0 && (
                    <div className="life-day-allday-strip">
                      {allDayEvents.map((e) => (
                        <span key={e.id} className="life-day-allday-badge">
                          {e.title || '(Untitled)'}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="life-day-timeline-body">
                    {Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => {
                      const h = DAY_START_HOUR + i
                      const label = h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`
                      return (
                        <button
                          type="button"
                          key={h}
                          className="life-tl-row"
                          onClick={() => openDraft(date, h)}
                          aria-label={`Add event at ${label}`}
                        >
                          <span className="life-tl-label">{label}</span>
                          <span className="life-tl-line" />
                        </button>
                      )
                    })}

                    {timedEvents.map((event) => {
                      const startMin = getMinutesFromMidnight(event.start_time!, tz)
                      const endMin = event.end_time
                        ? getMinutesFromMidnight(event.end_time, tz)
                        : startMin + 60
                      const top = eventTopPct(startMin)
                      const height = eventHeightPct(startMin, endMin)
                      return (
                        <div
                          key={event.id}
                          className="life-tl-event"
                          style={{ top: `${top}%`, height: `${height}%` }}
                        >
                          <span className="life-tl-event-time">
                            {getLocalTimeLabel(event.start_time!, tz)}
                          </span>
                          <span className="life-tl-event-title">{event.title || '(Untitled)'}</span>
                        </div>
                      )
                    })}

                    {nowTop !== null && (
                      <div className="life-tl-now" style={{ top: `${nowTop}%` }}>
                        <span className="life-tl-now-dot" />
                        <span className="life-tl-now-line" />
                      </div>
                    )}

                    {draft && draft.date === date && (
                      <div
                        className="life-tl-draft"
                        style={{ top: `${eventTopPct(draft.hour * 60)}%` }}
                      >
                        <input
                          autoFocus
                          type="text"
                          className="text-input"
                          placeholder="New event…"
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveDraft()
                            if (e.key === 'Escape') setDraft(null)
                          }}
                        />
                        <div className="life-tl-draft-row">
                          <input
                            type="time"
                            className="text-input"
                            value={draftStart}
                            aria-label="Start time"
                            onChange={(e) => setDraftStart(e.target.value)}
                          />
                          <input
                            type="time"
                            className="text-input"
                            value={draftEnd}
                            aria-label="End time"
                            onChange={(e) => setDraftEnd(e.target.value)}
                          />
                          <button
                            type="button"
                            className="primary-button"
                            onClick={saveDraft}
                            disabled={saving}
                          >
                            {saving ? 'Saving…' : 'Add'}
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => setDraft(null)}
                            disabled={saving}
                          >
                            Cancel
                          </button>
                        </div>
                        {saveError ? <span className="error-text">{saveError}</span> : null}
                      </div>
                    )}
                  </div>

                  {cellTasks.length > 0 && (
                    <div className="life-day-tasks life-day-tasks-expanded">
                      {cellTasks.map((task) => (
                        <span className="life-day-task" key={task.id}>
                          <span className={`pri-dot pri-${task.priority}`} />
                          {task.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {isEmpty && (
                    <span className="life-day-empty life-day-empty-tl">Nothing scheduled</span>
                  )}
                </div>
              ) : (
                <>
                  <div className="life-day-events">
                    {cellEvents.map((event) => (
                      <div className="life-day-event" key={event.id}>
                        <span className="life-day-event-time">
                          {event.all_day
                            ? 'All day'
                            : event.start_time
                              ? getLocalTimeLabel(event.start_time, tz)
                              : ''}
                        </span>
                        <span className="life-day-event-title">{event.title || '(Untitled)'}</span>
                      </div>
                    ))}
                    {isEmpty ? <span className="life-day-empty">—</span> : null}
                  </div>
                  {cellTasks.length ? (
                    <div className="life-day-tasks">
                      {cellTasks.map((task) => (
                        <span className="life-day-task" key={task.id}>
                          <span className={`pri-dot pri-${task.priority}`} />
                          {task.title}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )
        })}
        </div>
      ) : (
        desktopWeek
      )}
    </div>
  )
}
