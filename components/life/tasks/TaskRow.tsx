'use client'

import { getProjectLabel } from '@/lib/life/projects'
import type { TaskRecord } from '@/lib/life/types'

export interface TaskRowProps {
  task: TaskRecord
  redirectTo: string
  variant?: 'default' | 'compact' | 'checklist'
  showProject?: boolean
  showDue?: boolean
  showPriority?: boolean
}

export function TaskRow({
  task,
  redirectTo,
  variant = 'default',
  showProject = true,
  showDue = true,
  showPriority = true,
}: TaskRowProps) {
  const projectLabel = task.project_slug
    ? getProjectLabel(task.project_slug) || task.project_slug
    : null
  const isDone = task.status === 'done'

  return (
    <div className={`life-task-row life-task-row-${variant}`}>
      <form action={`/api/life/tasks/${task.id}`} method="post" className="life-task-row-check">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="status" value={isDone ? 'open' : 'done'} />
        <button
          type="submit"
          className="life-task-checkbox"
          aria-label={isDone ? 'Reopen task' : 'Mark task done'}
        >
          {isDone ? '☑' : '☐'}
        </button>
      </form>
      <div className="life-task-row-body">
        <span className={`life-task-title ${isDone ? 'is-done' : ''}`}>{task.title}</span>
        {variant !== 'checklist' ? (
          <div className="life-task-row-meta">
            {showPriority ? (
              <span className={`priority-pill priority-${task.priority}`}>{task.priority}</span>
            ) : null}
            {showProject && projectLabel ? <span className="badge secondary">{projectLabel}</span> : null}
            {showDue && task.due_local_date ? (
              <span className="badge secondary">Due {task.due_local_date}</span>
            ) : null}
          </div>
        ) : null}
      </div>
      {variant !== 'checklist' ? (
        <div className="life-task-row-actions">
          {task.status !== 'in_progress' && task.status !== 'done' ? (
            <form action={`/api/life/tasks/${task.id}`} method="post">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="status" value="in_progress" />
              <button className="secondary-button" type="submit">
                Start
              </button>
            </form>
          ) : null}
          {task.status !== 'dismissed' && task.status !== 'done' ? (
            <form action={`/api/life/tasks/${task.id}`} method="post">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="status" value="dismissed" />
              <button className="secondary-button" type="submit">
                Dismiss
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
