'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { fetchJson } from '@/lib/life/client'
import { LIFE_PROJECTS } from '@/lib/life/projects'

type QuickKind = 'Task' | 'Event'

export function QuickAdd({
  redirectTo,
  localDate,
  textareaId,
}: {
  redirectTo: string
  localDate: string
  textareaId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState<QuickKind | null>(null)
  const [savingTask, setSavingTask] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)
  const [taskSaved, setTaskSaved] = useState(false)

  function toggle(kind: QuickKind) {
    setTaskError(null)
    setTaskSaved(false)
    setOpen((current) => (current === kind ? null : kind))
  }

  async function handleTaskSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (savingTask) return

    const form = event.currentTarget
    const data = new FormData(form)
    const title = String(data.get('title') || '').trim()
    if (!title) {
      setTaskError('Task title is required.')
      return
    }

    setSavingTask(true)
    setTaskError(null)
    setTaskSaved(false)

    try {
      await fetchJson('/api/life/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          projectSlug: String(data.get('projectSlug') || '') || null,
          priority: String(data.get('priority') || 'medium'),
          dueLocalDate: String(data.get('dueLocalDate') || '') || null,
        }),
      })

      form.reset()
      setTaskSaved(true)
      router.refresh()
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : 'Task creation failed.')
    } finally {
      setSavingTask(false)
    }
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
      </div>

      {open === 'Task' ? (
        <form onSubmit={handleTaskSubmit} className="life-quick-form">
          <label className="life-quick-field">
            <span className="life-quick-field-label">Task</span>
            <input autoFocus required type="text" name="title" placeholder="What needs doing?" className="text-input" />
          </label>
          <div className="life-quick-form-row">
            <label className="life-quick-field">
              <span className="life-quick-field-label">Project</span>
              <select className="text-input" defaultValue="" name="projectSlug">
                <option value="">Unassigned</option>
                {LIFE_PROJECTS.map((project) => (
                  <option key={project.slug} value={project.slug}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="life-quick-field">
              <span className="life-quick-field-label">Priority</span>
              <select className="text-input" defaultValue="medium" name="priority">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="life-quick-field">
              <span className="life-quick-field-label">Due</span>
              <input className="text-input" type="date" name="dueLocalDate" defaultValue="" />
            </label>
          </div>
          <div className="life-quick-form-actions">
            <button type="submit" className="primary-button" disabled={savingTask}>
              {savingTask ? 'Adding…' : 'Add task'}
            </button>
            {taskError ? <span className="error-text">{taskError}</span> : null}
            {taskSaved && !taskError ? <span className="life-quick-saved">Added ✓</span> : null}
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
    </div>
  )
}
