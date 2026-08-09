'use client'

// Today v2, Console layout. Up next sits above a two-column console: the
// left column is the writing surface (capture + morning brief), the right
// column stacks tasks/schedule/captured and scrolls on its own. Every
// element the live screen ships with is present: capture box, hold-to-
// capture, morning brief, captured feed, today's tasks, schedule.

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { MarkdownCard } from '@/components/life/MarkdownCard'
import { LifeHoverCard } from '@/components/life/ui/LifeHoverCard'

export interface TodayEvent {
  id: string
  title: string
  at: string
  ends: string
  allDay: boolean
  cal: string
  where: string
  startTime: string | null
}

export interface TodayTask {
  id: string
  title: string
  project: string
  pri: 'high' | 'medium' | 'low'
  late: number
}

export interface TodayEntry {
  id: string
  at: string
  text: string
}

interface TodayScreenProps {
  dateLabel: string
  events: TodayEvent[]
  nextEvent?: TodayEvent & { countdown: string }
  tasks: TodayTask[]
  entries: TodayEntry[]
  briefContent: string | null
}

/** Same card for Up next and each schedule row, so one event reads one way. */
function EventCard({ event }: { event: TodayEvent }) {
  return (
    // The card IS the link — a separate "open" line inside it was a second
    // control for the thing you were already pointing at.
    <Link href="/life/month" className="life-hc">
      <span className="life-hc-title">{event.title}</span>
      <span className="life-hc-row">
        <span>When</span>
        <span>{event.allDay ? 'All day' : `${event.at} – ${event.ends}`}</span>
      </span>
      <span className="life-hc-row">
        <span>Calendar</span>
        <span>{event.cal}</span>
      </span>
      {event.where ? (
        <span className="life-hc-row">
          <span>Where</span>
          <span>{event.where}</span>
        </span>
      ) : null}
    </Link>
  )
}

/** Task twin of EventCard. Earns its place by completing the title — the row
 *  ellipsizes it — and by naming the priority the dot only colour-codes. */
function TaskCard({ task }: { task: TodayTask }) {
  return (
    <Link href="/life/tasks" className="life-hc">
      <span className="life-hc-title">{task.title}</span>
      <span className="life-hc-row">
        <span>Project</span>
        <span>{task.project}</span>
      </span>
      <span className="life-hc-row">
        <span>Priority</span>
        <span>{task.pri}</span>
      </span>
      <span className="life-hc-row">
        <span>Due</span>
        <span className={task.late > 0 ? 'is-alert' : ''}>
          {task.late > 0 ? `${task.late}d overdue` : 'Today'}
        </span>
      </span>
    </Link>
  )
}

// ponytail: no JS height measurement. It computed `innerHeight - top - 24`,
// which ignored .life-app-shell's own bottom padding and so ran ~24px too
// tall — that was the scroll that kept coming back. The CSS height in
// today-v2.css is correct, and `overflow: hidden` on .t2 means a wrong guess
// clips instead of scrolling the page.

/* ── Shared pieces ─────────────────────────────────────────────────────── */

/**
 * Clock and date are set at the same size and weight deliberately: on a screen
 * called Today, which day it is carries exactly as much as what time it is.
 * Up next sits opposite them, right-aligned, so the next event isn't repeated
 * a second time below.
 */
function TodayHead({
  dateLabel,
  nextEvent,
  taskCount,
  lateCount,
}: {
  dateLabel: string
  nextEvent?: TodayEvent & { countdown: string }
  taskCount: number
  lateCount: number
}) {
  const [clock, setClock] = useState('--:--')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="t2-head">
      <div className="t2-top">
        <div className="t2-stamp">
          <span className="t2-time" suppressHydrationWarning>{clock}</span>
          <span className="t2-rule" aria-hidden="true" />
          <span className="t2-date">{dateLabel}</span>
        </div>
        {nextEvent ? (
          <LifeHoverCard card={<EventCard event={nextEvent} />}>
            <Link href="/life/month" className="t2-upnext">
              <span className="t2-upnext-label">Up next</span>
              <span className="t2-upnext-row">
                <span className="t2-upnext-time">{nextEvent.at}</span>
                <span className="t2-upnext-title">{nextEvent.title}</span>
              </span>
              <span className="t2-upnext-countdown">{nextEvent.countdown}</span>
            </Link>
          </LifeHoverCard>
        ) : null}
      </div>
      <p className="t2-status">
        {taskCount} tasks
        <span className="t2-sep">·</span>
        <em>{lateCount} overdue</em>
      </p>
    </header>
  )
}

function Capture() {
  const [note, setNote] = useState('')
  const [holding, setHolding] = useState(false)

  return (
    <div className="t2-capture">
      {/* rows={1} is load-bearing: a textarea's rows attribute is an intrinsic
          height floor that minmax(0, 1fr) cannot override, and it defaults to 2.
          With the default, the box refused to shrink and pushed the footer —
          the Save button — past the bottom of the column. It still fills the
          space, because .t2-input sets height: 100%. */}
      <textarea
        className="t2-input"
        rows={1}
        value={note}
        placeholder="What happened?"
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="t2-capture-foot">
        <button
          type="button"
          className={`t2-hold${holding ? ' is-holding' : ''}`}
          onPointerDown={() => setHolding(true)}
          onPointerUp={() => setHolding(false)}
          onPointerLeave={() => setHolding(false)}
        >
          <span className="t2-hold-dot" aria-hidden="true" />
          {holding ? 'Listening…' : 'Hold to capture'}
        </button>
        <span className="life-kbd">⌘↵</span>
        <button type="button" className="life-btn primary" disabled={!note.trim()}>
          Save
        </button>
      </div>
    </div>
  )
}

/** Keeps the shipped card anatomy: head + count pill, body, footer link. */
function Card({
  title,
  count,
  action,
  children,
  className = '',
}: {
  title: string
  count?: number
  action?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`life-card t2-card ${className}`}>
      <div className="life-card-head">
        <h3>{title}</h3>
        {count != null ? <span className="count-pill">{count}</span> : null}
      </div>
      {children}
      {action ? (
        <div className="life-card-foot">
          <a className="life-card-action" href="#preview">
            {action} →
          </a>
        </div>
      ) : null}
    </section>
  )
}

function TasksBody({ tasks }: { tasks: TodayTask[] }) {
  if (tasks.length === 0) {
    return <div className="life-empty">Nothing queued.</div>
  }
  return (
    <div className="t2-tasks">
      {tasks.map((task) => (
        <LifeHoverCard key={task.id} card={<TaskCard task={task} />}>
          {/* A link like the schedule rows: a row whose hover card is clickable
              but which isn't clickable itself is a dead spot in the middle. */}
          <Link href="/life/tasks" className="t2-task">
            <span className="t2-check" role="checkbox" aria-checked="false" tabIndex={0}>
              ✓
            </span>
            <span className={`pri-dot pri-${task.pri}`} aria-hidden="true" />
            <span className="t2-task-title">{task.title}</span>
            <span className="t2-task-project">{task.project}</span>
            {task.late > 0 ? <span className="t2-task-late">+{task.late}d</span> : null}
          </Link>
        </LifeHoverCard>
      ))}
    </div>
  )
}

function ScheduleBody({ events }: { events: TodayEvent[] }) {
  if (events.length === 0) {
    return <div className="life-empty">No events.</div>
  }
  return (
    <div className="t2-lines">
      {events.map((event) => (
        <LifeHoverCard key={event.id} card={<EventCard event={event} />}>
          <Link href="/life/month" className="t2-line">
            <span className="t2-at">{event.allDay ? 'ALL DAY' : event.at}</span>
            <span className="t2-line-title">{event.title}</span>
          </Link>
        </LifeHoverCard>
      ))}
    </div>
  )
}

function CapturedBody({ entries }: { entries: TodayEntry[] }) {
  if (entries.length === 0) {
    return <div className="life-empty">Nothing captured yet.</div>
  }
  return (
    <div className="t2-lines">
      {entries.map((entry) => (
        <div key={entry.id} className="t2-feed">
          <span className="t2-at">{entry.at}</span>
          <span className="t2-feed-text">{entry.text}</span>
        </div>
      ))}
    </div>
  )
}

/* ── The screen ────────────────────────────────────────────────────────── */

export function TodayScreen({ dateLabel, events, nextEvent, tasks, entries, briefContent }: TodayScreenProps) {
  const lateCount = tasks.filter((task) => task.late > 0).length
  return (
    <div className="t2">
      <TodayHead dateLabel={dateLabel} nextEvent={nextEvent} taskCount={tasks.length} lateCount={lateCount} />

      <div className="t2-console">
        <div className="t2-console-left">
          <Capture />
        </div>
        <div className="t2-console-right">
          <Card title="Today’s tasks" count={tasks.length} action="View all tasks">
            <TasksBody tasks={tasks} />
          </Card>
          <Card title="Schedule" count={events.length} action="Open calendar">
            <ScheduleBody events={events} />
          </Card>
          <Card title="Captured today" count={entries.length} action="View entries">
            <CapturedBody entries={entries} />
          </Card>
          <Card title="Morning brief" className="t2-brief-card">
            {briefContent ? (
              <MarkdownCard content={briefContent} />
            ) : (
              <div className="life-empty">No brief yet today.</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
