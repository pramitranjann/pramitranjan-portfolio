'use client'

import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { fetchJson } from '@/lib/life/client'
import { useViewportMode } from '@/hooks/useViewportMode'
import { addDays, getTimeParts, getWeekStart, localDateTimeToUtc } from '@/lib/life/time'
import type { CalendarEventRecord, TaskRecord } from '@/lib/life/types'

interface MonthResponse {
  start: string
  end: string
  timezone: string
  events: CalendarEventRecord[]
  tasks: TaskRecord[]
}

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  const aUtc = Date.UTC(ay, am - 1, ad)
  const bUtc = Date.UTC(by, bm - 1, bd)
  return Math.round((bUtc - aUtc) / (24 * 3600 * 1000))
}

function daysInMonth(year: number, month1: number): number {
  return new Date(Date.UTC(year, month1, 0)).getUTCDate()
}

function monthLabel(monthAnchor: string, timeZone: string) {
  const date = localDateTimeToUtc(monthAnchor, timeZone, 12, 0)
  return new Intl.DateTimeFormat('en-US', { timeZone, month: 'long', year: 'numeric' }).format(date)
}

function monthParts(monthAnchor: string, timeZone: string) {
  const date = localDateTimeToUtc(monthAnchor, timeZone, 12, 0)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'long',
    year: 'numeric',
  }).formatToParts(date)
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return {
    month: lookup.month ?? '',
    year: lookup.year ?? '',
  }
}

function monthChipText(event: CalendarEventRecord, timeZone: string) {
  if (event.all_day || !event.start_time) {
    return event.title || '(Untitled)'
  }

  const parts = getTimeParts(new Date(event.start_time), timeZone)
  const hh = String(parts.hour).padStart(2, '0')
  const mm = String(parts.minute).padStart(2, '0')
  return `${hh}:${mm} ${event.title || '(Untitled)'}`
}

function browserLocalDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function MonthClient({
  initialMonth,
  today,
  timezone,
}: {
  initialMonth: string
  today: string
  timezone: string
}) {
  const router = useRouter()
  const viewport = useViewportMode()
  const [monthAnchor, setMonthAnchor] = useState(initialMonth) // YYYY-MM-01
  const [data, setData] = useState<MonthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [browserToday, setBrowserToday] = useState(today)

  // The grid always starts on the Monday on/before the 1st, and runs enough
  // whole weeks to cover the final day of the month (5 or 6 rows).
  const { gridStart, gridEnd, gridDays, monthIndex } = useMemo(() => {
    const [year, month1] = monthAnchor.split('-').map(Number)
    const firstOfMonth = `${monthAnchor.slice(0, 7)}-01`
    const start = getWeekStart(firstOfMonth)
    const lastDay = daysInMonth(year, month1)
    const offset = daysBetween(start, firstOfMonth) // 0..6
    const totalCells = Math.ceil((offset + lastDay) / 7) * 7
    const days = Array.from({ length: totalCells }, (_, i) => addDays(start, i))
    return {
      gridStart: start,
      gridEnd: addDays(start, totalCells - 1),
      gridDays: days,
      monthIndex: month1, // 1-based; cells outside this month are dimmed
    }
  }, [monthAnchor])

  useEffect(() => {
    const syncToday = () => setBrowserToday(browserLocalDateString(new Date()))
    syncToday()
    const id = window.setInterval(syncToday, 60_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchJson<MonthResponse>(`/api/life/month?start=${gridStart}&end=${gridEnd}`)
      .then((payload) => {
        if (!cancelled) setData(payload)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load month.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [gridStart, gridEnd])

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
    const map = new Map<string, number>()
    for (const task of data?.tasks || []) {
      if (!task.due_local_date) continue
      map.set(task.due_local_date, (map.get(task.due_local_date) || 0) + 1)
    }
    return map
  }, [data])

  const tz = data?.timezone || timezone
  const isPhone = viewport === 'phone'
  const labelParts = monthParts(monthAnchor, tz)
  const phoneRowHeight = Math.max(76, Math.floor(460 / Math.max(5, gridDays.length / 7)))
  const monthGridStyle = {
    '--life-month-phone-row-height': `${phoneRowHeight}px`,
  } as CSSProperties

  function shiftMonth(delta: number) {
    const [year, month1] = monthAnchor.split('-').map(Number)
    const next = new Date(Date.UTC(year, month1 - 1 + delta, 1))
    const y = next.getUTCFullYear()
    const m = String(next.getUTCMonth() + 1).padStart(2, '0')
    setMonthAnchor(`${y}-${m}-01`)
  }

  function openDay(date: string) {
    // Day click jumps to the Week view containing that day - that's where the
    // expandable timeline lives.
    router.push(`/life/review?week=${getWeekStart(date)}`)
  }

  const liveToday = browserToday || today
  const isCurrentMonth = monthAnchor.slice(0, 7) === liveToday.slice(0, 7)

  return (
    <div className="life-week-shell">
      <div className="life-month-phone-head">
        <div className="life-month-phone-title">
          <strong>{labelParts.month}</strong>
          <span>{labelParts.year}</span>
        </div>
        <div className="life-month-phone-actions">
          <button type="button" className="life-month-phone-nav" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            {'‹'}
          </button>
          <button type="button" className="life-month-phone-nav" onClick={() => shiftMonth(1)} aria-label="Next month">
            {'›'}
          </button>
        </div>
      </div>
      <div className="life-page-head life-month-desktop-head">
        <div>
          <p className="eyebrow">Month</p>
          <h1>{monthLabel(monthAnchor, tz)}</h1>
        </div>
        <div className="life-week-toolbar">
          <button type="button" className="life-icon-btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            ←
          </button>
          <button
            type="button"
            className="life-btn ghost"
            onClick={() => setMonthAnchor(`${liveToday.slice(0, 7)}-01`)}
            disabled={isCurrentMonth}
          >
            Today
          </button>
          <button type="button" className="life-icon-btn" onClick={() => shiftMonth(1)} aria-label="Next month">
            →
          </button>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="life-month-weekdays">
        {WEEKDAY_NAMES.map((name) => (
          <span key={name} className="life-month-weekday">
            <span className="life-month-weekday-long">{name}</span>
            <span className="life-month-weekday-short">{name.slice(0, 1)}</span>
          </span>
        ))}
      </div>
      <div
        className="life-month-grid"
        style={monthGridStyle}
      >
        {gridDays.map((date) => {
          const isToday = date === liveToday
          const inMonth = Number(date.slice(5, 7)) === monthIndex
          const dayNum = date.slice(8).replace(/^0/, '')
          const dayEvents = eventsByDate.get(date) || []
          const eventCount = dayEvents.length
          const taskCount = tasksByDueDate.get(date) || 0
          const firstEvent = dayEvents[0]
          const extraEventCount = Math.max(0, eventCount - 1)
          return (
            <button
              type="button"
              key={date}
              onClick={() => openDay(date)}
              className={[
                'life-month-cell',
                isToday ? 'life-month-today' : '',
                inMonth ? '' : 'life-month-out',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`${date} — ${eventCount} events, ${taskCount} tasks due`}
            >
              <span className="life-month-date">{dayNum}</span>
              <span className="life-month-marks">
                {isPhone ? (
                  <span className="life-month-phone-markers">
                    {firstEvent ? (
                      <span className="life-month-chip">
                        {monthChipText(firstEvent, tz)}
                      </span>
                    ) : null}
                    {extraEventCount > 0 ? (
                      <span className="life-month-more">+{extraEventCount}</span>
                    ) : null}
                  </span>
                ) : (
                  <>
                    {eventCount > 0 ? (
                      <span className="life-month-dots">
                        {Array.from({ length: Math.min(eventCount, 4) }, (_, i) => (
                          <span key={i} className="life-month-dot" />
                        ))}
                      </span>
                    ) : null}
                    {taskCount > 0 ? <span className="life-month-task-count">{taskCount} ✓</span> : null}
                  </>
                )}
              </span>
            </button>
          )
        })}
      </div>
      {loading && !data ? null : null}
    </div>
  )
}
