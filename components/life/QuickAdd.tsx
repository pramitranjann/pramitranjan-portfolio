'use client'

import { useState } from 'react'

import { LIFE_PROJECTS } from '@/lib/life/projects'

type QuickKind = 'Task' | 'Event' | 'Habit'

export function QuickAdd({
  redirectTo,
  localDate,
  textareaId,
}: {
  redirectTo: string
  localDate: string
  textareaId: string
}) {
  const [open, setOpen] = useState<QuickKind | null>(null)

  function toggle(kind: QuickKind) {
    setOpen((current) => (current === kind ? null : kind))
  }

  function focusComposer() {
    setOpen(null)
    const el = document.getElementById(textareaId) as HTMLTextAreaElement | null
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      el.focus()
    }
  }

  return (
    <div className="life-quick-wrap">
      <div className="life-quick">
        <span className="life-quick-label">Quick add</span>
        <button
          type="button"
          className={`life-quick-chip${open === 'Task' ? ' is-open' : ''}`}
          onClick={() => toggle('Task')}
        >
          ＋ Task
        </button>
        <button type="button" className="life-quick-chip" onClick={focusComposer}>
          ＋ Note
        </button>
        <button
          type="button"
          className={`life-quick-chip${open === 'Event' ? ' is-open' : ''}`}
          onClick={() => toggle('Event')}
        >
          ＋ Event
        </button>
        <button
          type="button"
          className={`life-quick-chip${open === 'Habit' ? ' is-open' : ''}`}
          onClick={() => toggle('Habit')}
        >
          ＋ Habit
        </button>
      </div>

      {open === 'Task' ? (
        <form action="/api/life/tasks" method="post" className="life-quick-form">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input autoFocus required type="text" name="title" placeholder="Task title" className="text-input" />
          <div className="life-quick-form-row">
            <select className="text-input" defaultValue="" name="projectSlug">
              <option value="">Unassigned</option>
              {LIFE_PROJECTS.map((project) => (
                <option key={project.slug} value={project.slug}>
                  {project.name}
                </option>
              ))}
            </select>
            <select className="text-input" defaultValue="medium" name="priority">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input className="text-input" type="date" name="dueLocalDate" defaultValue="" />
            <button type="submit" className="primary-button">
              Add task
            </button>
          </div>
        </form>
      ) : null}

      {open === 'Event' ? (
        <form action="/api/life/calendar/events" method="post" className="life-quick-form">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input autoFocus required type="text" name="title" placeholder="Event title" className="text-input" />
          <div className="life-quick-form-row">
            <input className="text-input" type="date" name="localDate" defaultValue={localDate} />
            <input className="text-input" type="time" name="startTime" aria-label="Start time" />
            <input className="text-input" type="time" name="endTime" aria-label="End time" />
            <label className="life-quick-check">
              <input type="checkbox" name="allDay" value="on" /> All day
            </label>
            <button type="submit" className="primary-button">
              Add event
            </button>
          </div>
        </form>
      ) : null}

      {open === 'Habit' ? (
        <form action="/api/life/habits" method="post" className="life-quick-form">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input autoFocus required type="text" name="title" placeholder="Habit (e.g. Read 20 pages)" className="text-input" />
          <div className="life-quick-form-row">
            <select className="text-input" defaultValue="daily" name="cadence">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <button type="submit" className="primary-button">
              Add habit
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
