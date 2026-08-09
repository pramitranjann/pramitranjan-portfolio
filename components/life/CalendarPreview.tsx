'use client'

// ponytail: visual prototype only — static mock data, no API, no auth.
// Delete this file, its route, and the `.life-cal-*` CSS block to remove.

import { useMemo, useState } from 'react'

interface MockEvent {
  date: string // YYYY-MM-DD
  start?: string // HH:MM, omitted for all-day
  end?: string
  title: string
}

const MOCK_EVENTS: MockEvent[] = [
  { date: '2026-08-03', start: '09:30', end: '09:45', title: 'Standup' },
  { date: '2026-08-03', start: '14:00', end: '15:30', title: 'Design review — onboarding' },
  { date: '2026-08-04', start: '11:00', end: '12:00', title: '1:1 with Ivan' },
  { date: '2026-08-05', start: '09:30', end: '09:45', title: 'Standup' },
  { date: '2026-08-05', start: '10:00', end: '12:00', title: 'Deep work — case study' },
  { date: '2026-08-05', start: '15:00', end: '16:00', title: 'Vendor call' },
  { date: '2026-08-05', start: '19:30', end: '21:00', title: 'Dinner — Franklins' },
  { date: '2026-08-06', start: '07:00', end: '08:00', title: 'Gym' },
  { date: '2026-08-06', start: '13:00', end: '14:00', title: 'Portfolio crit' },
  { date: '2026-08-07', title: 'Offsite — Sentosa' },
  { date: '2026-08-10', start: '09:30', end: '09:45', title: 'Standup' },
  { date: '2026-08-11', start: '16:00', end: '17:00', title: 'Dentist' },
  { date: '2026-08-12', start: '09:30', end: '09:45', title: 'Standup' },
  { date: '2026-08-12', start: '10:30', end: '12:00', title: 'Deep work — Rolodex' },
  { date: '2026-08-12', start: '14:00', end: '15:00', title: 'Design review — pricing' },
  { date: '2026-08-12', start: '18:00', end: '19:00', title: 'Gym' },
  { date: '2026-08-14', title: 'Flight SIN → KUL' },
  { date: '2026-08-17', start: '09:30', end: '09:45', title: 'Standup' },
  { date: '2026-08-18', start: '11:00', end: '12:00', title: '1:1 with Ivan' },
  { date: '2026-08-20', start: '10:00', end: '12:30', title: 'Deep work — motion reel' },
  { date: '2026-08-24', start: '09:30', end: '09:45', title: 'Standup' },
  { date: '2026-08-26', start: '15:00', end: '16:30', title: 'Quarterly planning' },
]

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const TODAY = '2026-08-05' // ponytail: pinned so the prototype always looks alive

function pad(n: number) {
  return String(n).padStart(2, '0')
}

/** Every cell of the grid: Monday on/before the 1st, through whole weeks. */
function buildGrid(year: number, month0: number) {
  const first = new Date(Date.UTC(year, month0, 1))
  const offset = (first.getUTCDay() + 6) % 7 // Mon = 0
  const start = new Date(Date.UTC(year, month0, 1 - offset))
  const lastDay = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate()
  const cells = Math.ceil((offset + lastDay) / 7) * 7

  return Array.from({ length: cells }, (_, i) => {
    const d = new Date(start.getTime() + i * 86400000)
    return {
      key: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === month0,
    }
  })
}

function agendaHeading(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dt.getUTCDay()]
  return { weekday, day: d, month: MONTHS[m - 1] }
}

export function CalendarPreview() {
  const [anchor, setAnchor] = useState({ year: 2026, month0: 7 }) // Aug 2026
  const [selected, setSelected] = useState(TODAY)
  // Same markup, same data — only the token layer swaps, so the diff you see
  // is purely what your design system does.
  const [skin, setSkin] = useState<'ds' | 'reui'>('ds')

  const grid = useMemo(() => buildGrid(anchor.year, anchor.month0), [anchor])

  const byDate = useMemo(() => {
    const map = new Map<string, MockEvent[]>()
    for (const ev of MOCK_EVENTS) {
      const list = map.get(ev.date) || []
      list.push(ev)
      map.set(ev.date, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.start || '').localeCompare(b.start || ''))
    }
    return map
  }, [])

  const shift = (delta: number) => {
    const next = new Date(Date.UTC(anchor.year, anchor.month0 + delta, 1))
    setAnchor({ year: next.getUTCFullYear(), month0: next.getUTCMonth() })
  }

  const dayEvents = byDate.get(selected) || []
  const heading = agendaHeading(selected)

  return (
    <div className={`life-cal-preview${skin === 'reui' ? ' life-cal-skin-reui' : ''}`}>
      <div className="life-page-head">
        <div>
          <p className="eyebrow">Prototype</p>
          <h1>Calendar</h1>
        </div>
        <div className="life-cal-skin-toggle" role="group" aria-label="Skin">
          <button
            type="button"
            onClick={() => setSkin('ds')}
            aria-pressed={skin === 'ds'}
            className={skin === 'ds' ? 'is-active' : ''}
          >
            Your DS
          </button>
          <button
            type="button"
            onClick={() => setSkin('reui')}
            aria-pressed={skin === 'reui'}
            className={skin === 'reui' ? 'is-active' : ''}
          >
            reui default
          </button>
        </div>
      </div>

      <div className="life-cal-layout">
        <div className="life-cal-card">
          <div className="life-cal-head">
            <button
              type="button"
              className="life-cal-nav"
              onClick={() => shift(-1)}
              aria-label="Previous month"
            >
              ‹
            </button>
            <div className="life-cal-title">
              <strong>{MONTHS[anchor.month0]}</strong>
              <span>{anchor.year}</span>
            </div>
            <button
              type="button"
              className="life-cal-nav"
              onClick={() => shift(1)}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="life-cal-weekdays">
            {WEEKDAYS.map((name, i) => (
              <span key={i} className="life-cal-weekday">
                {name}
              </span>
            ))}
          </div>

          <div className="life-cal-grid">
            {grid.map((cell) => {
              const count = (byDate.get(cell.key) || []).length
              return (
                <button
                  type="button"
                  key={cell.key}
                  onClick={() => setSelected(cell.key)}
                  aria-label={`${cell.key}, ${count} events`}
                  aria-pressed={cell.key === selected}
                  className={[
                    'life-cal-day',
                    cell.inMonth ? '' : 'is-out',
                    cell.key === TODAY ? 'is-today' : '',
                    cell.key === selected ? 'is-selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="life-cal-day-num">{cell.day}</span>
                  <span className="life-cal-day-dots" aria-hidden="true">
                    {Array.from({ length: Math.min(count, 3) }, (_, i) => (
                      <span key={i} className="life-cal-dot" />
                    ))}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="life-cal-foot">
            <button type="button" className="life-cal-today-btn" onClick={() => {
              setAnchor({ year: 2026, month0: 7 })
              setSelected(TODAY)
            }}>
              Today
            </button>
            <span className="life-cal-count">{MOCK_EVENTS.length} events this month</span>
          </div>
        </div>

        <div className="life-cal-agenda">
          <div className="life-cal-agenda-head">
            <p className="eyebrow">{heading.weekday}</p>
            <h2>
              {heading.day} <span>{heading.month}</span>
            </h2>
          </div>

          {dayEvents.length === 0 ? (
            <p className="life-cal-empty">Nothing scheduled.</p>
          ) : (
            <ul className="life-cal-list">
              {dayEvents.map((ev, i) => (
                <li key={i} className="life-cal-item">
                  <span className="life-cal-item-time">
                    {ev.start ? ev.start : 'All day'}
                    {ev.end ? <em>{ev.end}</em> : null}
                  </span>
                  <span className="life-cal-item-title">{ev.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
