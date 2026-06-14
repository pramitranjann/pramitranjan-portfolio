'use client'

import { useState } from 'react'

import { LIFE_PROJECTS } from '@/lib/life/projects'

export function AddTaskInline({
  redirectTo,
  defaultProject = '',
  defaultDue = '',
  placeholder = 'New task',
}: {
  redirectTo: string
  defaultProject?: string
  defaultDue?: string
  placeholder?: string
}) {
  const [expanded, setExpanded] = useState(false)

  if (!expanded) {
    return (
      <button type="button" className="life-add-inline-trigger" onClick={() => setExpanded(true)}>
        + Add task
      </button>
    )
  }

  return (
    <form action="/api/life/tasks" method="post" className="life-add-inline">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input
        autoFocus
        required
        type="text"
        name="title"
        placeholder={placeholder}
        className="text-input"
      />
      <div className="life-add-inline-row">
        <select className="text-input" defaultValue={defaultProject} name="projectSlug">
          <option value="">Unassigned</option>
          {LIFE_PROJECTS.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
        <select className="text-input" defaultValue="medium" name="priority">
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input className="text-input" type="date" name="dueLocalDate" defaultValue={defaultDue} />
        <button type="submit" className="primary-button">
          Add
        </button>
        <button type="button" className="secondary-button" onClick={() => setExpanded(false)}>
          Cancel
        </button>
      </div>
    </form>
  )
}
