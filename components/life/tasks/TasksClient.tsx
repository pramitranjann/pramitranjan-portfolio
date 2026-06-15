'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { LIFE_PROJECTS, getProjectLabel } from '@/lib/life/projects'
import type { TaskRecord, TaskStatus } from '@/lib/life/types'

type TaskView = 'List' | 'Board'
type TaskFilter = 'All' | 'Today'
type ColumnKey = 'open' | 'in_progress' | 'done'

const STORAGE_KEY = 'life.tasksView'
const DEFAULT_VIEW: TaskView = 'Board'
const REDIRECT_TO = '/life/tasks'
const PRI_LABEL: Record<string, string> = { high: 'High', medium: 'Med', low: 'Low' }

const COLUMNS: Array<{ key: ColumnKey; label: string; mark: string }> = [
  { key: 'open', label: 'To do', mark: 'var(--life-label)' },
  { key: 'in_progress', label: 'In progress', mark: 'var(--life-amber)' },
  { key: 'done', label: 'Done', mark: 'var(--life-green)' },
]

function readStoredView(): TaskView {
  if (typeof window === 'undefined') return DEFAULT_VIEW
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'List' || stored === 'Board' ? stored : DEFAULT_VIEW
}

export function TasksClient({
  tasks,
  today,
  error,
}: {
  tasks: TaskRecord[]
  today: string
  error: string | null
}) {
  const router = useRouter()
  const [view, setView] = useState<TaskView>(DEFAULT_VIEW)
  const [filter, setFilter] = useState<TaskFilter>('All')
  const [addOpen, setAddOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [items, setItems] = useState<TaskRecord[]>(tasks)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<ColumnKey | null>(null)
  const [moveError, setMoveError] = useState<string | null>(null)

  useEffect(() => {
    setView(readStoredView())
    setMounted(true)
  }, [])

  useEffect(() => {
    setItems(tasks)
  }, [tasks])

  function handleViewChange(next: TaskView) {
    setView(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* localStorage may be unavailable in private mode */
    }
  }

  async function moveTask(taskId: string, status: ColumnKey) {
    const current = items.find((task) => task.id === taskId)
    if (!current || current.status === status) return

    const previous = items
    setItems((list) => list.map((task) => (task.id === taskId ? { ...task, status } : task)))
    setMoveError(null)

    try {
      const response = await fetch(`/api/life/tasks/${taskId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status as TaskStatus, redirectTo: REDIRECT_TO }),
      })
      if (!response.ok) throw new Error('Failed to move task.')
      router.refresh()
    } catch (err) {
      setItems(previous)
      setMoveError(err instanceof Error ? err.message : 'Failed to move task.')
    }
  }

  function handleDrop(column: ColumnKey) {
    if (dragId) moveTask(dragId, column)
    setDragId(null)
    setDragOverCol(null)
  }

  const todayCount = items.filter((task) => task.due_local_date === today).length
  const shown = filter === 'All' ? items : items.filter((task) => task.due_local_date === today)

  return (
    <div className="life-tasks-shell">
      <div className="life-page-head">
        <div>
          <p className="eyebrow">Tasks</p>
          <h1>Everything on the list</h1>
        </div>
        <button
          type="button"
          className="life-btn primary"
          onClick={() => setAddOpen((open) => !open)}
        >
          ＋ New task
        </button>
      </div>

      {addOpen ? (
        <form action="/api/life/tasks" method="post" className="life-add-inline">
          <input type="hidden" name="redirectTo" value={REDIRECT_TO} />
          <input
            autoFocus
            required
            type="text"
            name="title"
            placeholder="New task"
            className="text-input"
          />
          <div className="life-add-inline-row">
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
              Add
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="life-tasks-toolbar">
        <div className="life-tasks-filters">
          <button
            type="button"
            className={`filter-chip${filter === 'All' ? ' is-active' : ''}`}
            onClick={() => setFilter('All')}
          >
            All <span className="chip-count">{tasks.length}</span>
          </button>
          <button
            type="button"
            className={`filter-chip${filter === 'Today' ? ' is-active' : ''}`}
            onClick={() => setFilter('Today')}
          >
            Today <span className="chip-count">{todayCount}</span>
          </button>
        </div>
        <div className="segmented">
          {(['List', 'Board'] as TaskView[]).map((option) => (
            <button
              key={option}
              type="button"
              className={`segmented-item${view === option ? ' is-active' : ''}`}
              onClick={() => handleViewChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {moveError ? <p className="error-text">{moveError}</p> : null}

      {!mounted ? null : view === 'List' ? (
        <div className="life-list">
          {shown.length === 0 ? <div className="life-empty">Nothing here.</div> : null}
          {shown.map((task) => {
            const isDone = task.status === 'done'
            const projectLabel = task.project_slug
              ? getProjectLabel(task.project_slug) || task.project_slug
              : 'General'
            const dueLabel = task.due_local_date === today ? 'Today' : task.due_local_date || ''
            return (
              <div className="life-task-row" key={task.id}>
                <form action={`/api/life/tasks/${task.id}`} method="post">
                  <input type="hidden" name="redirectTo" value={REDIRECT_TO} />
                  <input type="hidden" name="status" value={isDone ? 'open' : 'done'} />
                  <button
                    type="submit"
                    className={`life-check${isDone ? ' is-done' : ''}`}
                    aria-label={isDone ? 'Reopen task' : 'Mark task done'}
                  >
                    ✓
                  </button>
                </form>
                <div className="life-task-main">
                  <span className={`life-task-title${isDone ? ' is-done' : ''}`}>{task.title}</span>
                </div>
                <div className="life-task-meta">
                  <span className="life-tag">{projectLabel}</span>
                  <span
                    className="filter-chip"
                    style={{ minHeight: 22, padding: '0 8px', pointerEvents: 'none' }}
                  >
                    <span className={`pri-dot pri-${task.priority}`} />
                    {PRI_LABEL[task.priority]}
                  </span>
                  {dueLabel ? <span className="life-row-aside">{dueLabel}</span> : null}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="life-kanban">
          {COLUMNS.map((column) => {
            const columnItems = shown.filter((task) => task.status === column.key)
            return (
              <div
                className={`life-kanban-col${dragOverCol === column.key ? ' is-dragover' : ''}`}
                key={column.key}
                onDragOver={(event) => {
                  event.preventDefault()
                  if (dragOverCol !== column.key) setDragOverCol(column.key)
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                    setDragOverCol((current) => (current === column.key ? null : current))
                  }
                }}
                onDrop={() => handleDrop(column.key)}
              >
                <div className="life-kanban-col-head">
                  <span className="col-mark" style={{ background: column.mark }} />
                  <h3>{column.label}</h3>
                  <span className="count-pill">{columnItems.length}</span>
                </div>
                <div className="life-kanban-list">
                  {columnItems.length === 0 ? (
                    <div className="life-kanban-empty">Nothing here.</div>
                  ) : null}
                  {columnItems.map((task) => {
                    const projectLabel = task.project_slug
                      ? getProjectLabel(task.project_slug) || task.project_slug
                      : 'General'
                    return (
                      <div
                        className={`life-kanban-card${dragId === task.id ? ' is-dragging' : ''}`}
                        key={task.id}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = 'move'
                          event.dataTransfer.setData('text/plain', task.id)
                          setDragId(task.id)
                        }}
                        onDragEnd={() => {
                          setDragId(null)
                          setDragOverCol(null)
                        }}
                      >
                        <div className="life-kanban-card-title">{task.title}</div>
                        <div className="life-kanban-card-meta">
                          <span className="life-tag">{projectLabel}</span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 12,
                              color: 'var(--life-label)',
                            }}
                          >
                            <span className={`pri-dot pri-${task.priority}`} />
                            {PRI_LABEL[task.priority]}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
