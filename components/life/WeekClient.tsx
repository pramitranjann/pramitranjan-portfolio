'use client'

import type { CSSProperties } from 'react'
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

const DESKTOP_DAY_START_HOUR = 0
const DESKTOP_DAY_END_HOUR = 24
const DESKTOP_HOUR_HEIGHT = 56
const DESKTOP_DAY_TOTAL_MINUTES =
  (DESKTOP_DAY_END_HOUR - DESKTOP_DAY_START_HOUR) * 60
const PHONE_DAY_START_HOUR = 0
const PHONE_DAY_END_HOUR = 24
const PHONE_VISIBLE_HOURS = 6
const PHONE_ROW_HEIGHT = 64
const PHONE_RAIL_WIDTH = 48
const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKDAY_LONG_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export interface WeekResponse {
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
  return Math.max(
    0,
    ((startMin - DESKTOP_DAY_START_HOUR * 60) / DESKTOP_DAY_TOTAL_MINUTES) * 100,
  )
}

function eventHeightPct(startMin: number, endMin: number): number {
  const clampedStart = Math.max(startMin, DESKTOP_DAY_START_HOUR * 60)
  const clampedEnd = Math.min(endMin, DESKTOP_DAY_END_HOUR * 60)
  return Math.max(2, ((clampedEnd - clampedStart) / DESKTOP_DAY_TOTAL_MINUTES) * 100)
}

function formatHourLabel(hour: number) {
  if (hour === 0 || hour === 24) return '12 AM'
  if (hour === 12) return '12 PM'
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
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
  if (!event.start_time) return DESKTOP_DAY_START_HOUR * 60
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
    Math.max(hour, PHONE_DAY_START_HOUR),
    PHONE_DAY_END_HOUR - PHONE_VISIBLE_HOURS,
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

function fullDateLabel(localDate: string, timeZone: string) {
  const date = localDateTimeToUtc(localDate, timeZone, 12, 0)
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function browserLocalDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function WeekClient({
  initialStart,
  today,
  timezone,
  initialData = null,
}: {
  initialStart: string
  today: string
  timezone: string
  initialData?: WeekResponse | null
}) {
  const viewport = useViewportMode()
  const [weekStart, setWeekStart] = useState(initialStart)
  const [data, setData] = useState<WeekResponse | null>(initialData)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(
    initialStart === getWeekStart(today) ? today : initialStart,
  )
  const [nowMinutes, setNowMinutes] = useState<number | null>(null)
  const [browserToday, setBrowserToday] = useState(today)
  const [refreshKey, setRefreshKey] = useState(0)
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftStart, setDraftStart] = useState('')
  const [draftEnd, setDraftEnd] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const phoneWindowRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const desktopScrollRef = useRef<HTMLDivElement | null>(null)

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])
  const dayList = useMemo(() => range(weekStart, 7), [weekStart])
  const currentWeekStart = useMemo(
    () => getWeekStart(browserToday || today),
    [browserToday, today],
  )
  const tz = data?.timezone || timezone

  const isCurrentWeek = weekStart === currentWeekStart
  const liveToday = browserToday || today
  const desktopTimelineHeight = `${(DESKTOP_DAY_END_HOUR - DESKTOP_DAY_START_HOUR) * DESKTOP_HOUR_HEIGHT}px`
  const desktopWeekCols = '56px repeat(7, minmax(0, 1fr))'
  const desktopHours = useMemo(
    () =>
      Array.from({ length: DESKTOP_DAY_END_HOUR - DESKTOP_DAY_START_HOUR + 1 }, (_, index) => {
        const hour = DESKTOP_DAY_START_HOUR + index
        return {
          hour,
          top: `${(hour - DESKTOP_DAY_START_HOUR) * DESKTOP_HOUR_HEIGHT}px`,
          label: formatHourLabel(hour),
        }
      }),
    [],
  )

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
    setSelectedDate((current) => {
      if (current >= weekStart && current <= weekEnd) return current
      return liveToday >= weekStart && liveToday <= weekEnd ? liveToday : weekStart
    })
    setDraft(null)
  }, [liveToday, weekEnd, weekStart])

  useEffect(() => {
    function tick() {
      const now = new Date()
      setNowMinutes(now.getHours() * 60 + now.getMinutes())
      setBrowserToday(browserLocalDateString(now))
    }
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEventRecord[]>()
    for (const event of data?.events || []) {
      const list = map.get(event.local_date) || []
      list.push(event)
      map.set(event.local_date, list)
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

  const phoneHourRows = useMemo(
    () =>
      Array.from({ length: PHONE_DAY_END_HOUR - PHONE_DAY_START_HOUR + 1 }, (_, index) => {
        const hour = PHONE_DAY_START_HOUR + index
        return {
          hour,
          label: formatHourLabel(hour),
        }
      }),
    [],
  )

  useEffect(() => {
    if (viewport !== 'phone' || !selectedDate) return
    const container = phoneWindowRefs.current[selectedDate]
    if (!container) return

    const visibleEvents = positionedEventsByDate.get(selectedDate) || []
    const preferredHour = getPreferredPhoneWindowHour({
      date: selectedDate,
      events: visibleEvents,
      today: liveToday,
      nowMinutes,
    })
    container.scrollTop = (preferredHour - PHONE_DAY_START_HOUR) * PHONE_ROW_HEIGHT
  }, [liveToday, nowMinutes, positionedEventsByDate, selectedDate, viewport])

  useEffect(() => {
    if (viewport === 'phone') return
    const container = desktopScrollRef.current
    if (!container) return
    // When the visible week contains today, line the scroll up with the current
    // time (with a little lead above so it isn't jammed against the top edge);
    // otherwise rest at the start of the day. Read the clock directly rather
    // than from nowMinutes so this doesn't re-scroll on every minute tick.
    if (liveToday >= weekStart && liveToday <= weekEnd) {
      const now = new Date()
      const nowHour = now.getHours() + now.getMinutes() / 60
      const leadHours = 1.5
      const target = (nowHour - DESKTOP_DAY_START_HOUR - leadHours) * DESKTOP_HOUR_HEIGHT
      container.scrollTop = Math.max(0, target)
    } else {
      container.scrollTop = 0
    }
  }, [viewport, weekStart, weekEnd, liveToday])

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
    const hour = event.start_time
      ? getTimeParts(new Date(event.start_time), tz).hour
      : DESKTOP_DAY_START_HOUR
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

  function openCreateDraftFromPoint(date: string, clientY: number, rect: DOMRect) {
    const ratio = Math.min(Math.max((clientY - rect.top) / rect.height, 0), 0.999)
    const minutes = DESKTOP_DAY_START_HOUR * 60 + ratio * DESKTOP_DAY_TOTAL_MINUTES
    openCreateDraft(
      date,
      Math.max(
        DESKTOP_DAY_START_HOUR,
        Math.min(DESKTOP_DAY_END_HOUR - 1, Math.floor(minutes / 60)),
      ),
    )
  }

  function toggleDraftAllDay() {
    if (!draft) return
    const nextAllDay = !draft.allDay
    setDraft((current) => (current ? { ...current, allDay: nextAllDay } : null))
    if (nextAllDay) {
      setDraftStart('')
      setDraftEnd('')
      return
    }
    const baseHour = draft.hour
    setDraftStart(`${String(baseHour).padStart(2, '0')}:00`)
    setDraftEnd(`${String(Math.min(baseHour + 1, 23)).padStart(2, '0')}:00`)
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

  const desktopScrollStyle = {
    maxHeight: 'calc(100vh - 200px)',
    overflow: 'auto',
    padding: '10px 0',
  } satisfies CSSProperties

  const desktopWeek = (
    <div className="life-week-desktop">
      <div className="life-week-desktop-head">
        <div className="life-week-corner" />
        {dayList.map((date, index) => {
          const isToday = date === liveToday
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
        <div className="life-week-allday-label">all-day</div>
        {dayList.map((date) => {
          const allDayEvents = (eventsByDate.get(date) || []).filter((event) => event.all_day)
          return (
            <div
              key={`${date}-all-day`}
              className={`life-week-allday-cell${date === liveToday ? ' is-today' : ''}`}
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

      <div className="life-week-desktop-scroll" ref={desktopScrollRef} style={desktopScrollStyle}>
        <div className="life-week-scroll-grid" style={{ gridTemplateColumns: desktopWeekCols }}>
          <div className="life-week-hour-rail" style={{ height: desktopTimelineHeight }}>
            {desktopHours.map((row) => (
            <span
              key={row.hour}
              className="life-week-hour-label"
              style={{ top: row.top }}
            >
              {row.label}
            </span>
          ))}
          </div>

          {dayList.map((date) => {
            const isToday = date === liveToday
            const positioned = positionedEventsByDate.get(date) || []
            const nowTop =
              isToday && nowMinutes !== null
                ? `${(Math.min(DESKTOP_DAY_END_HOUR, Math.max(DESKTOP_DAY_START_HOUR, nowMinutes / 60)) - DESKTOP_DAY_START_HOUR) * DESKTOP_HOUR_HEIGHT}px`
                : null

            return (
              <div
                key={`${date}-timeline`}
                className={`life-week-day-col${isToday ? ' is-today' : ''}`}
                style={{ height: desktopTimelineHeight }}
                onDoubleClick={(event) =>
                  openCreateDraftFromPoint(date, event.clientY, event.currentTarget.getBoundingClientRect())
                }
              >
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
                        {item.event.start_time
                          ? getLocalTimeLabel(item.event.start_time, tz)
                          : 'All day'}
                      </div>
                      <div className="life-week-event-title">{item.event.title || '(Untitled)'}</div>
                    </button>
                  )
                })}

                {nowTop !== null ? (
                  <div className="life-week-now-line" style={{ top: nowTop }}>
                    <span className="life-week-now-dot" />
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const phoneEvents = eventsByDate.get(selectedDate) || []
  const phoneAllDayEvents = phoneEvents.filter((event) => event.all_day)
  const phonePositionedEvents = positionedEventsByDate.get(selectedDate) || []
  const phoneDateIndex = dayList.indexOf(selectedDate)
  const phoneIsToday = selectedDate === liveToday
  const phoneNowVisible = phoneIsToday && nowMinutes !== null
  const phoneEventCount = phoneEvents.length
  const phoneMeta = `${fullDateLabel(selectedDate, tz).replace(/^...\s/, '').toUpperCase()} · ${
    phoneEventCount === 0 ? 'NO EVENTS' : `${phoneEventCount} ${phoneEventCount === 1 ? 'EVENT' : 'EVENTS'}`
  }`

  const phoneWeek = (
    <div className="life-week-phone">
      <div className="life-week-phone-topbar">
        <div className="life-week-phone-range">
          <span className="eyebrow">Week {isoWeek(weekStart)}</span>
          <strong>{formatRange(weekStart, weekEnd, tz)}</strong>
        </div>
        <div className="life-week-phone-actions">
          <button
            type="button"
            className="life-icon-btn"
            onClick={() => {
              setWeekStart((current) => addDays(current, -7))
              setSelectedDate((current) => addDays(current, -7))
            }}
            aria-label="Previous week"
          >
            ←
          </button>
          <button
            type="button"
            className="life-btn ghost"
            onClick={() => {
              setWeekStart(getWeekStart(liveToday))
              setSelectedDate(liveToday)
            }}
            disabled={isCurrentWeek && selectedDate === liveToday}
          >
            Today
          </button>
          <button
            type="button"
            className="life-icon-btn"
            onClick={() => {
              setWeekStart((current) => addDays(current, 7))
              setSelectedDate((current) => addDays(current, 7))
            }}
            aria-label="Next week"
          >
            →
          </button>
        </div>
      </div>

      <div className="life-week-phone-strip" role="tablist" aria-label="Week days">
        {dayList.map((date, index) => {
          const isToday = date === liveToday
          const isSelected = date === selectedDate
          const { day } = dayMonth(date, tz)

          return (
            <button
              key={date}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`life-week-phone-day${isSelected ? ' is-selected' : ''}${isToday ? ' is-today' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <span className="life-week-phone-letter">{WEEKDAY_NAMES[index % 7].slice(0, 1)}</span>
              <span className="life-week-phone-number">{day}</span>
            </button>
          )
        })}
      </div>

      <div className="life-week-phone-head">
        <div className="life-week-phone-head-copy">
          <h2>{WEEKDAY_LONG_NAMES[Math.max(phoneDateIndex, 0)]}</h2>
          <p>{phoneMeta}</p>
        </div>
      </div>

      {phoneAllDayEvents.length > 0 ? (
        <div className="life-week-phone-allday">
          {phoneAllDayEvents.map((event) => (
            <button
              key={event.id}
              type="button"
              className="life-week-phone-allday-badge"
              onClick={() => openEditDraft(event)}
            >
              {event.title || '(Untitled)'}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className="life-week-phone-scroll"
        ref={(node) => {
          phoneWindowRefs.current[selectedDate] = node
        }}
      >
        <div className="life-week-phone-track">
          {phoneHourRows.map((row, index) => (
            <button
              type="button"
              key={`${selectedDate}-${row.hour}`}
              className="life-week-phone-row"
              style={{ top: `${index * PHONE_ROW_HEIGHT}px` }}
              onClick={() => openCreateDraft(selectedDate, Math.min(row.hour, 23))}
              aria-label={`Add event at ${row.label}`}
            >
              <span className="life-week-phone-row-label">{row.label}</span>
              <span className="life-week-phone-row-line" />
            </button>
          ))}

          {phonePositionedEvents.map((item) => {
            const top = ((item.startMin - PHONE_DAY_START_HOUR * 60) / 60) * PHONE_ROW_HEIGHT
            const height =
              Math.max(
                Math.min(item.endMin, PHONE_DAY_END_HOUR * 60) -
                  Math.max(item.startMin, PHONE_DAY_START_HOUR * 60),
                30,
              ) /
                60 *
                PHONE_ROW_HEIGHT -
              2
            const left =
              item.colCount > 1
                ? `calc(${PHONE_RAIL_WIDTH}px + ${item.colIndex} * ((100% - ${PHONE_RAIL_WIDTH}px) / ${item.colCount}))`
                : `${PHONE_RAIL_WIDTH}px`
            const width =
              item.colCount > 1
                ? `calc(((100% - ${PHONE_RAIL_WIDTH}px) / ${item.colCount}) - 6px)`
                : `calc(100% - ${PHONE_RAIL_WIDTH}px)`

            return (
              <button
                key={item.event.id}
                type="button"
                className="life-week-phone-event"
                style={{ top: `${top}px`, height: `${height}px`, left, width }}
                onClick={() => openEditDraft(item.event)}
              >
                <span className="life-week-phone-event-time">
                  {item.event.start_time ? getLocalTimeLabel(item.event.start_time, tz) : 'All day'}
                </span>
                <span className="life-week-phone-event-title">
                  {item.event.title || '(Untitled)'}
                </span>
              </button>
            )
          })}

          {phoneNowVisible ? (
            <div
              className="life-week-phone-now"
              style={{ top: `${(nowMinutes! / 60) * PHONE_ROW_HEIGHT}px` }}
            >
              <span className="life-week-phone-now-pill">
                {String(Math.floor(nowMinutes! / 60)).padStart(2, '0')}:
                {String(nowMinutes! % 60).padStart(2, '0')}
              </span>
              <span className="life-week-phone-now-line" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="life-week-shell">
        <div className="life-page-head">
          <div>
            <p className="eyebrow">Week {isoWeek(weekStart)}</p>
            <h1>{formatRange(weekStart, weekEnd, tz)}</h1>
          </div>
          <div className="life-week-toolbar">
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
        {viewport === 'phone' ? (
          phoneWeek
        ) : (
          desktopWeek
        )}
      </div>

      {draft ? (
        <div className={`life-week-composer-overlay${viewport === 'phone' ? ' is-phone' : ''}`}>
          <div className="life-week-composer-backdrop" onClick={resetDraft} />
          <aside className={`life-week-composer-panel${viewport === 'phone' ? ' is-phone' : ''}`}>
            <div className="life-week-composer-head">
              <h2>{draft.mode === 'edit' ? 'Edit event' : 'New event'}</h2>
              <div className="life-week-composer-actions">
                <button type="button" className="life-btn ghost" onClick={resetDraft}>
                  Cancel
                </button>
                <button type="button" className="life-btn primary" onClick={saveDraft} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            <div className="life-week-composer-body">
              <label className="life-week-composer-field">
                <span className="life-week-composer-label">Title</span>
                <input
                  autoFocus
                  type="text"
                  className="text-input"
                  value={draftTitle}
                  placeholder="Untitled event"
                  onChange={(event) => setDraftTitle(event.target.value)}
                />
              </label>

              <div className="life-week-composer-field">
                <span className="life-week-composer-label">Date</span>
                <div className="life-week-composer-static">{fullDateLabel(draft.date, tz)}</div>
              </div>

              <div className="life-week-composer-toggle">
                <span>All-day</span>
                <button
                  type="button"
                  className={`life-week-toggle${draft.allDay ? ' is-active' : ''}`}
                  onClick={toggleDraftAllDay}
                  aria-pressed={draft.allDay}
                >
                  <span className="life-week-toggle-thumb" />
                </button>
              </div>

              {!draft.allDay ? (
                <div className="life-week-composer-time-row">
                  <label className="life-week-composer-field">
                    <span className="life-week-composer-label">Start</span>
                    <input
                      type="time"
                      className="text-input"
                      value={draftStart}
                      onChange={(event) => setDraftStart(event.target.value)}
                    />
                  </label>

                  <label className="life-week-composer-field">
                    <span className="life-week-composer-label">End</span>
                    <input
                      type="time"
                      className="text-input"
                      value={draftEnd}
                      onChange={(event) => setDraftEnd(event.target.value)}
                    />
                  </label>
                </div>
              ) : null}

              {saveError ? <span className="error-text">{saveError}</span> : null}

              {draft.mode === 'edit' && draft.eventId ? (
                <button type="button" className="life-week-composer-delete" onClick={deleteDraftEvent} disabled={saving}>
                  Delete event
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  )
}
