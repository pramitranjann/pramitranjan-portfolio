'use client'

import { useEffect, useState } from 'react'

import type { TaskRecord } from '@/lib/life/types'

import { ChecklistView } from './ChecklistView'
import { InboxView } from './InboxView'
import { KanbanView } from './KanbanView'
import { ListView } from './ListView'
import { TasksToolbar } from './TasksToolbar'

export type TaskView = 'kanban' | 'inbox' | 'list' | 'checklist'

const STORAGE_KEY = 'life.tasksView'
const DEFAULT_VIEW: TaskView = 'kanban'

function readStoredView(): TaskView {
  if (typeof window === 'undefined') return DEFAULT_VIEW
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'kanban' || stored === 'inbox' || stored === 'list' || stored === 'checklist') {
    return stored
  }
  return DEFAULT_VIEW
}

export function TasksClient({
  tasks,
  status,
  project,
  error,
}: {
  tasks: TaskRecord[]
  status: string
  project: string
  error: string | null
}) {
  const [view, setView] = useState<TaskView>(DEFAULT_VIEW)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setView(readStoredView())
    setMounted(true)
  }, [])

  function handleViewChange(next: TaskView) {
    setView(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* localStorage may be unavailable in private mode */
    }
  }

  const redirectTo = `/life/tasks?status=${status}${project ? `&project=${project}` : ''}`

  return (
    <div className="life-tasks-shell">
      <TasksToolbar status={status} project={project} view={view} onViewChange={handleViewChange} />
      {error ? <p className="error-text">{error}</p> : null}
      {!mounted ? (
        <p className="muted-text">Loading view…</p>
      ) : view === 'kanban' ? (
        <KanbanView tasks={tasks} redirectTo={redirectTo} />
      ) : view === 'inbox' ? (
        <InboxView tasks={tasks} redirectTo={redirectTo} />
      ) : view === 'list' ? (
        <ListView tasks={tasks} redirectTo={redirectTo} />
      ) : (
        <ChecklistView tasks={tasks} redirectTo={redirectTo} />
      )}
    </div>
  )
}
