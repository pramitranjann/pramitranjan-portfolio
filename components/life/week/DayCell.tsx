'use client'

import { AddTaskInline } from '@/components/life/tasks/AddTaskInline'
import { TaskRow } from '@/components/life/tasks/TaskRow'
import { getLocalTimeLabel } from '@/lib/life/time'
import type { CalendarEventRecord, TaskRecord } from '@/lib/life/types'

export interface DayCellProps {
  date: string
  weekday: string
  dayLabel: string
  status: 'past' | 'today' | 'future'
  events: CalendarEventRecord[]
  tasks: TaskRecord[]
  timezone: string
  redirectTo: string
  variant: 'grid' | 'stack'
}

export function DayCell({
  date,
  weekday,
  dayLabel,
  status,
  events,
  tasks,
  timezone,
  redirectTo,
  variant,
}: DayCellProps) {
  return (
    <article className={`life-day-cell life-day-${status} life-day-${variant}`}>
      <header className="life-day-cell-head">
        <span className="life-day-weekday">{weekday}</span>
        <span className="life-day-date">{dayLabel}</span>
        <span className={`life-day-dot life-day-dot-${status}`} aria-hidden="true" />
      </header>
      <div className="life-day-cell-body">
        {events.length > 0 ? (
          <ul className="life-day-events">
            {events.map((event) => (
              <li key={event.id}>
                <span className="life-day-event-time">
                  {event.all_day
                    ? 'All day'
                    : event.start_time
                      ? getLocalTimeLabel(event.start_time, timezone)
                      : '—'}
                </span>
                <span className="life-day-event-title">{event.title || '(Untitled)'}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {tasks.length > 0 ? (
          <ul className="life-day-tasks">
            {tasks.map((task) => (
              <li key={task.id}>
                <TaskRow
                  task={task}
                  redirectTo={redirectTo}
                  variant="compact"
                  showProject={false}
                  showDue={false}
                />
              </li>
            ))}
          </ul>
        ) : null}
        {events.length === 0 && tasks.length === 0 ? (
          <p className="muted-text life-day-empty">Open</p>
        ) : null}
      </div>
      <footer className="life-day-cell-foot">
        <AddTaskInline redirectTo={redirectTo} defaultDue={date} placeholder="Plan…" />
      </footer>
    </article>
  )
}
