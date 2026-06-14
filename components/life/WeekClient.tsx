'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { DayCell } from '@/components/life/week/DayCell'
import { fetchJson } from '@/lib/life/client'
import { addDays, getDisplayDate, getWeekStart } from '@/lib/life/time'
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
  const [twoWeek, setTwoWeek] = useState(false)
  const [data, setData] = useState<WeekResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const todayRef = useRef<HTMLDivElement | null>(null)

  const days = twoWeek ? 14 : 7
  const weekEnd = useMemo(() => addDays(weekStart, days - 1), [weekStart, days])
  const dayList = useMemo(() => range(weekStart, days), [weekStart, days])

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
    const past = new Set(dayList.filter((d) => d < today))
    setCollapsed(past)
  }, [dayList, today])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.innerWidth >= 1100) return
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

  function stepWeek(direction: -1 | 1) {
    setWeekStart((current) => addDays(current, 7 * direction))
  }

  function snapToToday() {
    setWeekStart(getWeekStart(today))
  }

  function expandDay(date: string) {
    setCollapsed((c) => {
      const next = new Set(c)
      next.delete(date)
      return next
    })
  }

  const headerLabel = `${getDisplayDate(weekStart, timezone)} — ${getDisplayDate(weekEnd, timezone)}`
  const tz = data?.timezone || timezone

  return (
    <div className="life-week-shell">
      <div className="life-week-toolbar">
        <button
          type="button"
          className="secondary-button"
          onClick={() => stepWeek(-1)}
          aria-label="Previous week"
        >
          ←
        </button>
        <span className="life-week-range">{headerLabel}</span>
        <button
          type="button"
          className="secondary-button"
          onClick={() => stepWeek(1)}
          aria-label="Next week"
        >
          →
        </button>
        <button type="button" className="secondary-button" onClick={snapToToday}>
          Today
        </button>
        <div className="segmented">
          <button
            type="button"
            className={`segmented-item ${!twoWeek ? 'is-active' : ''}`}
            onClick={() => setTwoWeek(false)}
          >
            1w
          </button>
          <button
            type="button"
            className={`segmented-item ${twoWeek ? 'is-active' : ''}`}
            onClick={() => setTwoWeek(true)}
          >
            2w
          </button>
        </div>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      {loading && !data ? <p className="muted-text">Loading week…</p> : null}
      <div className={`life-week-grid ${twoWeek ? 'is-two' : 'is-one'}`}>
        {dayList.map((date, index) => {
          const status = date < today ? 'past' : date === today ? 'today' : 'future'
          const weekday = WEEKDAY_NAMES[index % 7]
          const dayLabel = date.slice(8)
          const isCollapsed = collapsed.has(date)
          const cellEvents = eventsByDate.get(date) || []
          const cellTasks = tasksByDueDate.get(date) || []

          if (isCollapsed) {
            return (
              <button
                key={date}
                type="button"
                className="life-day-collapsed"
                onClick={() => expandDay(date)}
              >
                <span className="life-day-collapsed-label">
                  {weekday} {dayLabel}
                </span>
                <span className="muted-text">
                  {cellEvents.length} events · {cellTasks.length} tasks
                </span>
              </button>
            )
          }

          return (
            <div key={date} ref={status === 'today' ? todayRef : undefined}>
              <DayCell
                date={date}
                weekday={weekday}
                dayLabel={dayLabel}
                status={status}
                events={cellEvents}
                tasks={cellTasks}
                timezone={tz}
                redirectTo={`/life/review?week=${weekStart}`}
                variant="grid"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
