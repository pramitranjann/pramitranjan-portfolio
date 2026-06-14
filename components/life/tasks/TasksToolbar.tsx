'use client'

import Link from 'next/link'

import { LIFE_PROJECTS } from '@/lib/life/projects'

import type { TaskView } from './TasksClient'

const STATUSES: Array<{ value: string; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'Doing' },
  { value: 'done', label: 'Done' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'all', label: 'All' },
]

const VIEWS: Array<{ value: TaskView; label: string }> = [
  { value: 'kanban', label: 'Kanban' },
  { value: 'inbox', label: 'Inbox' },
  { value: 'list', label: 'List' },
  { value: 'checklist', label: 'Checklist' },
]

export function TasksToolbar({
  status,
  project,
  view,
  onViewChange,
}: {
  status: string
  project: string
  view: TaskView
  onViewChange: (v: TaskView) => void
}) {
  return (
    <div className="life-tasks-toolbar">
      <div className="life-tasks-toolbar-row">
        <div className="segmented" role="tablist" aria-label="View">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              type="button"
              role="tab"
              aria-selected={view === v.value}
              className={`segmented-item ${view === v.value ? 'is-active' : ''}`}
              onClick={() => onViewChange(v.value)}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="life-tasks-toolbar-filters">
          <div className="toolbar">
            {STATUSES.map((s) => (
              <Link
                key={s.value}
                className={`filter-chip ${status === s.value ? 'is-active' : ''}`}
                href={`/life/tasks?status=${s.value}${project ? `&project=${project}` : ''}`}
              >
                {s.label}
              </Link>
            ))}
          </div>
          <form method="get" action="/life/tasks" className="life-tasks-project-select">
            <input type="hidden" name="status" value={status} />
            <select
              className="text-input"
              defaultValue={project}
              name="project"
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
            >
              <option value="">All projects</option>
              {LIFE_PROJECTS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </form>
        </div>
      </div>
    </div>
  )
}
