'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { fetchJson } from '@/lib/life/client'
import { addDays, getLocalTimeLabel, getWeekStart, localDateTimeToUtc } from '@/lib/life/time'
import type { CalendarEventRecord, TaskRecord } from '@/lib/life/types'

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
  const [weekStart, setWeekStart] = useState(initialStart)
  const [data, setData] = useState<WeekResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const todayRef = useRef<HTMLDivElement | null>(null)

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])
  const dayList = useMemo(() => range(weekStart, 7), [weekStart])

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
  }, [weekStart, weekEnd])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.innerWidth >= 981) return
    todayRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [data, weekStart])

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

  return (
    <div className="life-week-shell">
      <div className="life-page-head">
        <div>
          <p className="eyebrow">Week {isoWeek(weekStart)}</p>
          <h1>This week</h1>
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

      <div className="life-week-grid">
        {dayList.map((date, index) => {
          const isToday = date === today
          const isPast = date < today
          const dayNum = date.slice(8).replace(/^0/, '')
          const cellEvents = eventsByDate.get(date) || []
          const cellTasks = tasksByDueDate.get(date) || []
          const isEmpty = cellEvents.length === 0 && cellTasks.length === 0

          return (
            <div
              key={date}
              ref={isToday ? todayRef : undefined}
              className={`life-day-cell${isToday ? ' life-day-today' : ''}${isPast ? ' life-day-past' : ''}`}
            >
              <div className="life-day-head">
                <span className="life-day-weekday">{WEEKDAY_NAMES[index % 7]}</span>
                <span className="life-day-date">{dayNum}</span>
              </div>
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
