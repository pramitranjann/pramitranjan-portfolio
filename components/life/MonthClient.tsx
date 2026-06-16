'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { fetchJson } from '@/lib/life/client'
import { addDays, getWeekStart, localDateTimeToUtc } from '@/lib/life/time'
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
  const [monthAnchor, setMonthAnchor] = useState(initialMonth) // YYYY-MM-01
  const [data, setData] = useState<MonthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    const map = new Map<string, number>()
    for (const ev of data?.events || []) {
      map.set(ev.local_date, (map.get(ev.local_date) || 0) + 1)
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

  function shiftMonth(delta: number) {
    const [year, month1] = monthAnchor.split('-').map(Number)
    const next = new Date(Date.UTC(year, month1 - 1 + delta, 1))
    const y = next.getUTCFullYear()
    const m = String(next.getUTCMonth() + 1).padStart(2, '0')
    setMonthAnchor(`${y}-${m}-01`)
  }

  function openDay(date: string) {
    // Day click jumps to the Week view containing that day — that's where the
    // expandable timeline lives.
    router.push(`/life/review?week=${getWeekStart(date)}`)
  }

  const isCurrentMonth = monthAnchor.slice(0, 7) === today.slice(0, 7)

  return (
    <div className="life-week-shell">
      <div className="life-page-head">
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
            onClick={() => setMonthAnchor(`${today.slice(0, 7)}-01`)}
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
      {loading && !data ? <p className="muted-text">Loading month…</p> : null}

      <div className="life-month-weekdays">
        {WEEKDAY_NAMES.map((name) => (
          <span key={name} className="life-month-weekday">
            {name}
          </span>
        ))}
      </div>
      <div className="life-month-grid">
        {gridDays.map((date) => {
          const isToday = date === today
          const inMonth = Number(date.slice(5, 7)) === monthIndex
          const dayNum = date.slice(8).replace(/^0/, '')
          const eventCount = eventsByDate.get(date) || 0
          const taskCount = tasksByDueDate.get(date) || 0
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
                {eventCount > 0 ? (
                  <span className="life-month-dots">
                    {Array.from({ length: Math.min(eventCount, 4) }, (_, i) => (
                      <span key={i} className="life-month-dot" />
                    ))}
                  </span>
                ) : null}
                {taskCount > 0 ? <span className="life-month-task-count">{taskCount} ☑</span> : null}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
