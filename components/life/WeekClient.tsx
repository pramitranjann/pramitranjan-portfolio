'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { useViewportMode } from '@/hooks/useViewportMode'
import { fetchJson } from '@/lib/life/client'
import {
  addDays,
  getLocalTimeLabel,
  getTimeParts,
  getWeekStart,
  localDateTimeToUtc,
} from '@/lib/life/time'
import type { CalendarEventRecord, TaskRecord } from '@/lib/life/types'

const DAY_START_HOUR = 7
const DAY_END_HOUR = 22
const DAY_TOTAL_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60
const PHONE_VISIBLE_HOURS = 6
const PHONE_ROW_HEIGHT = 52
const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface WeekResponse {
  start: string
  end: string
  timezone: string
  events: CalendarEventRecord[]
  tasks: TaskRecord[]
}

interface DraftState {
  mode: 'create' | 'edit'
  eventId?: string
  date: string
  hour: number
  allDay: boolean
}

interface PositionedEvent {
  event: CalendarEventRecord
  startMin: number
  endMin: number
  colIndex: number
  colCount: number
}

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

function formatHourLabel(hour: number) {
  return hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}

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
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return { day: lookup.day, month: lookup.month }
}

function formatRange(start: string, end: string, timeZone: string) {
  const s = dayMonth(start, timeZone)
  const e = dayMonth(end, timeZone)
  return s.month === e.month
    ? `${s.day} – ${e.day} ${e.month}`
    : `${s.day} ${s.month} – ${e.day} ${e.month}`
}

function getEventEndMin(event: CalendarEventRecord, timeZone: string) {
  if (!event.start_time) return DAY_START_HOUR * 60
  const startMin = getMinutesFromMidnight(event.start_time, timeZone)
  if (!event.end_time) return startMin + 60
  const endMin = getMinutesFromMidnight(event.end_time, timeZone)
  return endMin > startMin ? endMin : startMin + 60
}

function computeOverlapLayout(events: CalendarEventRecord[], timeZone: string): PositionedEvent[] {
  const items = events
    .filter((event) => !event.all_day && event.start_time)
    .map((event) => ({
      event,
      startMin: getMinutesFromMidnight(event.start_time!, timeZone),
      endMin: getEventEndMin(event, timeZone),
    }))
    .sort((left, right) => left.startMin - right.startMin || left.endMin - right.endMin)

  const positioned: Array<
    PositionedEvent & {
      _cluster: number
    }
  > = []
  let active: Array<{ endMin: number; colIndex: number; positionedIndex: number }> = []
  let clusterIndices: number[] = []
  let clusterCount = 0
  let clusterMaxCols = 1

  function finalizeCluster() {
    if (clusterIndices.length === 0) return
    for (const index of clusterIndices) {
      positioned[index].colCount = clusterMaxCols
    }
    clusterIndices = []
    clusterCount += 1
    clusterMaxCols = 1
  }

  for (const item of items) {
    active = active.filter((entry) => entry.endMin > item.startMin)
    if (active.length === 0) {
      finalizeCluster()
    }

    const usedCols = new Set(active.map((entry) => entry.colIndex))
    let colIndex = 0
    while (usedCols.has(colIndex)) colIndex += 1

    clusterMaxCols = Math.max(clusterMaxCols, active.length + 1)
    positioned.push({
      ...item,
      colIndex,
      colCount: 1,
      _cluster: clusterCount,
    })
    const positionedIndex = positioned.length - 1
    clusterIndices.push(positionedIndex)
    active.push({ endMin: item.endMin, colIndex, positionedIndex })
  }

  finalizeCluster()

  return positioned.map(({ _cluster, ...item }) => item)
}

function clampPhoneWindowStart(hour: number) {
  return Math.min(
    Math.max(hour, DAY_START_HOUR),
    DAY_END_HOUR - PHONE_VISIBLE_HOURS,
  )
}

function getPreferredPhoneWindowHour(args: {
  date: string
  events: PositionedEvent[]
  today: string
  nowMinutes: number | null
}) {
  if (args.date === args.today && args.nowMinutes !== null) {
    return clampPhoneWindowStart(Math.floor(args.nowMinutes / 60) - 1)
  }

  if (args.events.length > 0) {
    return clampPhoneWindowStart(Math.floor(args.events[0].startMin / 60) - 1)
  }

  return 9
}

function toTimeInputValue(event: CalendarEventRecord, timeZone: string, kind: 'start' | 'end') {
  const value = kind === 'start' ? event.start_time : event.end_time
  if (!value) return ''
  const parts = getTimeParts(new Date(value), timeZone)
  return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`
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
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftStart, setDraftStart] = useState('')
  const [draftEnd, setDraftEnd] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const todayRef = useRef<HTMLDivElement | null>(null)
  const didInitialScrollRef = useRef(false)
  const phoneWindowRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])
  const dayList = useMemo(() => range(weekStart, 7), [weekStart])
  const currentWeekStart = useMemo(() => getWeekStart(today), [today])
  const tz = data?.timezone || timezone

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

  useEffect(() => {
    didInitialScrollRef.current = false
    setExpandedDate(null)
    setDraft(null)
  }, [weekStart])

  useEffect(() => {
    function tick() {
      const parts = getTimeParts(new Date(), tz)
      setNowMinutes(parts.hour * 60 + parts.minute)
    }
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [tz])

  useEffect(() => {
    if (viewport !== 'phone') return
    if (didInitialScrollRef.current) return
    if (!isCurrentWeek) return
    if (!data) return
    didInitialScrollRef.current = true
    todayRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' })
  }, [data, isCurrentWeek, viewport])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEventRecord[]>()
    for (const event of data?.events || []) {
      const list = map.get(event.local_date) || []
      list.push(event)
      map.set(event.local_date, list)
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

  const positionedEventsByDate = useMemo(() => {
    const map = new Map<string, PositionedEvent[]>()
    for (const date of dayList) {
      map.set(date, computeOverlapLayout(eventsByDate.get(date) || [], tz))
    }
    return map
  }, [dayList, eventsByDate, tz])

  const hourRows = useMemo(
    () =>
      Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, index) => {
        const hour = DAY_START_HOUR + index
        return {
          hour,
          label: formatHourLabel(hour),
        }
      }),
    [],
  )

  useEffect(() => {
    if (viewport !== 'phone' || !expandedDate) return
    const container = phoneWindowRefs.current[expandedDate]
    if (!container) return

    const visibleEvents = positionedEventsByDate.get(expandedDate) || []
    const preferredHour = getPreferredPhoneWindowHour({
      date: expandedDate,
      events: visibleEvents,
      today,
      nowMinutes,
    })
    container.scrollTop = (preferredHour - DAY_START_HOUR) * PHONE_ROW_HEIGHT
  }, [expandedDate, nowMinutes, positionedEventsByDate, today, viewport])

  function resetDraft() {
    setDraft(null)
    setDraftTitle('')
    setDraftStart('')
    setDraftEnd('')
    setSaveError(null)
  }

  function openCreateDraft(date: string, hour: number) {
    setDraft({
      mode: 'create',
      date,
      hour,
      allDay: false,
    })
    setDraftTitle('')
    setDraftStart(`${String(hour).padStart(2, '0')}:00`)
    setDraftEnd(`${String(Math.min(hour + 1, 23)).padStart(2, '0')}:00`)
    setSaveError(null)
  }

  function openEditDraft(event: CalendarEventRecord) {
    const hour = event.start_time ? getTimeParts(new Date(event.start_time), tz).hour : DAY_START_HOUR
    setDraft({
      mode: 'edit',
      eventId: event.id,
      date: event.local_date,
      hour,
      allDay: event.all_day,
    })
    setDraftTitle(event.title || '')
    setDraftStart(event.all_day ? '' : toTimeInputValue(event, tz, 'start'))
    setDraftEnd(event.all_day ? '' : toTimeInputValue(event, tz, 'end'))
    setSaveError(null)
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
      if (draft.mode === 'edit' && draft.eventId) {
        await fetchJson(`/api/life/calendar/events/${encodeURIComponent(draft.eventId)}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            title,
            localDate: draft.date,
            startTime: draft.allDay ? null : draftStart || null,
            endTime: draft.allDay ? null : draftEnd || null,
            allDay: draft.allDay,
          }),
        })
      } else {
        await fetchJson('/api/life/calendar/events', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            title,
            localDate: draft.date,
            startTime: draft.allDay ? null : draftStart || null,
            endTime: draft.allDay ? null : draftEnd || null,
            allDay: draft.allDay,
          }),
        })
      }

      resetDraft()
      setRefreshKey((key) => key + 1)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save event.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteDraftEvent() {
    if (!draft?.eventId) return

    setSaving(true)
    setSaveError(null)

    try {
      await fetchJson(`/api/life/calendar/events/${encodeURIComponent(draft.eventId)}`, {
        method: 'DELETE',
      })
      resetDraft()
      setRefreshKey((key) => key + 1)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not delete event.')
    } finally {
      setSaving(false)
    }
  }

  const desktopWeek = (
    <div className="life-week-desktop">
      <div className="life-week-desktop-head">
        <div className="life-week-corner" />
        {dayList.map((date, index) => {
          const isToday = date === today
          const { day } = dayMonth(date, tz)
          return (
            <div key={date} className={`life-week-col-head${isToday ? ' is-today' : ''}`}>
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
                <button
                  key={event.id}
                  type="button"
                  className="life-week-allday-badge"
                  onClick={() => openEditDraft(event)}
                >
                  {event.title || '(Untitled)'}
                </button>
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
          const positioned = positionedEventsByDate.get(date) || []
          const nowTop = isToday && nowMinutes !== null ? eventTopPct(nowMinutes) : null

          return (
            <div key={`${date}-timeline`} className={`life-week-day-col${isToday ? ' is-today' : ''}`}>
              {positioned.map((item) => {
                const top = eventTopPct(item.startMin)
                const height = eventHeightPct(item.startMin, item.endMin)
                const left =
                  item.colCount > 1
                    ? `calc(${item.colIndex} * (100% / ${item.colCount}) + 3px)`
                    : '3px'
                const width =
                  item.colCount > 1
                    ? `calc((100% / ${item.colCount}) - 6px)`
                    : 'calc(100% - 6px)'

                return (
                  <button
                    key={item.event.id}
                    type="button"
                    className="life-week-event-card"
                    style={{ top: `${top}%`, height: `${height}%`, left, width }}
                    onClick={() => openEditDraft(item.event)}
                  >
                    <div className="life-week-event-time">
                      {item.event.start_time ? getLocalTimeLabel(item.event.start_time, tz) : 'All day'}
                    </div>
                    <div className="life-week-event-title">{item.event.title || '(Untitled)'}</div>
                  </button>
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
            const positioned = positionedEventsByDate.get(date) || []
            const allDayEvents = cellEvents.filter((event) => event.all_day)
            const isEmpty = cellEvents.length === 0 && cellTasks.length === 0
            const nowTop = isToday && nowMinutes !== null ? eventTopPct(nowMinutes) : null

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
                {isExpanded ? (
                  <>
                    <button
                      type="button"
                      className="life-day-head life-day-head-btn"
                      onClick={() => setExpandedDate(null)}
                      aria-expanded
                      aria-label={`${WEEKDAY_NAMES[index % 7]} ${dayNum} — collapse`}
                    >
                      <span className="life-day-weekday">{WEEKDAY_NAMES[index % 7]}</span>
                      <span className="life-day-date">{dayNum}</span>
                    </button>

                    <div className="life-day-timeline">
                      {allDayEvents.length > 0 ? (
                        <div className="life-day-allday-strip">
                          {allDayEvents.map((event) => (
                            <button
                              key={event.id}
                              type="button"
                              className="life-day-allday-badge"
                              onClick={() => openEditDraft(event)}
                            >
                              {event.title || '(Untitled)'}
                            </button>
                          ))}
                        </div>
                      ) : null}

                      <div
                        className="life-day-scroll-window"
                        ref={(node) => {
                          phoneWindowRefs.current[date] = node
                        }}
                      >
                        <div className="life-day-timeline-body">
                          {hourRows.map((row) => (
                            <button
                              type="button"
                              key={`${date}-${row.hour}`}
                              className="life-tl-row"
                              onClick={() => openCreateDraft(date, row.hour)}
                              aria-label={`Add event at ${row.label}`}
                            >
                              <span className="life-tl-label">{row.label}</span>
                              <span className="life-tl-line" />
                            </button>
                          ))}

                          {positioned.map((item) => {
                            const top = eventTopPct(item.startMin)
                            const height = eventHeightPct(item.startMin, item.endMin)
                            const left =
                              item.colCount > 1
                                ? `calc(44px + ${item.colIndex} * ((100% - 44px) / ${item.colCount}))`
                                : '44px'
                            const width =
                              item.colCount > 1
                                ? `calc(((100% - 44px) / ${item.colCount}) - 4px)`
                                : 'calc(100% - 44px)'

                            return (
                              <button
                                key={item.event.id}
                                type="button"
                                className="life-tl-event"
                                style={{ top: `${top}%`, height: `${height}%`, left, width }}
                                onClick={() => openEditDraft(item.event)}
                              >
                                <span className="life-tl-event-time">
                                  {item.event.start_time
                                    ? getLocalTimeLabel(item.event.start_time, tz)
                                    : 'All day'}
                                </span>
                                <span className="life-tl-event-title">
                                  {item.event.title || '(Untitled)'}
                                </span>
                              </button>
                            )
                          })}

                          {nowTop !== null ? (
                            <div className="life-tl-now" style={{ top: `${nowTop}%` }}>
                              <span className="life-tl-now-dot" />
                              <span className="life-tl-now-line" />
                            </div>
                          ) : null}

                          {draft && draft.date === date ? (
                            <div
                              className="life-tl-draft"
                              style={{ top: `${eventTopPct(draft.hour * 60)}%` }}
                            >
                              <input
                                autoFocus
                                type="text"
                                className="text-input"
                                placeholder={draft.mode === 'edit' ? 'Edit event…' : 'New event…'}
                                value={draftTitle}
                                onChange={(event) => setDraftTitle(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') saveDraft()
                                  if (event.key === 'Escape') resetDraft()
                                }}
                              />
                              {!draft.allDay ? (
                                <div className="life-tl-draft-row">
                                  <input
                                    type="time"
                                    className="text-input"
                                    value={draftStart}
                                    aria-label="Start time"
                                    onChange={(event) => setDraftStart(event.target.value)}
                                  />
                                  <input
                                    type="time"
                                    className="text-input"
                                    value={draftEnd}
                                    aria-label="End time"
                                    onChange={(event) => setDraftEnd(event.target.value)}
                                  />
                                  <button
                                    type="button"
                                    className="primary-button"
                                    onClick={saveDraft}
                                    disabled={saving}
                                  >
                                    {saving
                                      ? 'Saving…'
                                      : draft.mode === 'edit'
                                        ? 'Save'
                                        : 'Add'}
                                  </button>
                                  <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={resetDraft}
                                    disabled={saving}
                                  >
                                    Cancel
                                  </button>
                                  {draft.mode === 'edit' && draft.eventId ? (
                                    <button
                                      type="button"
                                      className="secondary-button life-event-delete"
                                      onClick={deleteDraftEvent}
                                      disabled={saving}
                                    >
                                      Delete
                                    </button>
                                  ) : null}
                                </div>
                              ) : (
                                <div className="life-tl-draft-row">
                                  <button
                                    type="button"
                                    className="primary-button"
                                    onClick={saveDraft}
                                    disabled={saving}
                                  >
                                    {saving ? 'Saving…' : 'Save'}
                                  </button>
                                  <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={resetDraft}
                                    disabled={saving}
                                  >
                                    Cancel
                                  </button>
                                  {draft.mode === 'edit' && draft.eventId ? (
                                    <button
                                      type="button"
                                      className="secondary-button life-event-delete"
                                      onClick={deleteDraftEvent}
                                      disabled={saving}
                                    >
                                      Delete
                                    </button>
                                  ) : null}
                                </div>
                              )}
                              {saveError ? <span className="error-text">{saveError}</span> : null}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {cellTasks.length > 0 ? (
                        <div className="life-day-tasks life-day-tasks-expanded">
                          {cellTasks.map((task) => (
                            <span className="life-day-task" key={task.id}>
                              <span className={`pri-dot pri-${task.priority}`} />
                              {task.title}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {isEmpty ? (
                        <span className="life-day-empty life-day-empty-tl">Nothing scheduled</span>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    className="life-day-cell-toggle"
                    onClick={() => setExpandedDate(date)}
                    aria-expanded={false}
                    aria-label={`${WEEKDAY_NAMES[index % 7]} ${dayNum} — expand`}
                  >
                    <div className="life-day-head">
                      <span className="life-day-weekday">{WEEKDAY_NAMES[index % 7]}</span>
                      <span className="life-day-date">{dayNum}</span>
                      {cellEvents.length > 0 ? (
                        <span className="life-day-dot-row">
                          {cellEvents.slice(0, 3).map((event) => (
                            <span key={event.id} className="life-day-dot" />
                          ))}
                        </span>
                      ) : null}
                    </div>

                    <div className="life-day-events">
                      {cellEvents.slice(0, 3).map((event) => (
                        <div className="life-day-event" key={event.id}>
                          <span className="life-day-event-time">
                            {event.all_day
                              ? 'All day'
                              : event.start_time
                                ? getLocalTimeLabel(event.start_time, tz)
                                : ''}
                          </span>
                          <span className="life-day-event-title">
                            {event.title || '(Untitled)'}
                          </span>
                        </div>
                      ))}
                      {isEmpty ? <span className="life-day-empty">—</span> : null}
                    </div>

                    {cellTasks.length > 0 ? (
                      <div className="life-day-tasks">
                        {cellTasks.slice(0, 3).map((task) => (
                          <span className="life-day-task" key={task.id}>
                            <span className={`pri-dot pri-${task.priority}`} />
                            {task.title}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </button>
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
