'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useViewportMode } from '@/hooks/useViewportMode'
import { fetchJson } from '@/lib/life/client'
import { getProjectLabel } from '@/lib/life/projects'
import { localDateTimeToUtc } from '@/lib/life/time'
import type { TaskPriority, TaskRecord, TaskStatus } from '@/lib/life/types'

type TaskView = 'List' | 'Board'
type TaskFilter = 'All' | 'Today'
type ColumnKey = 'open' | 'in_progress' | 'done'
type DesktopGroup = 'status' | 'project' | 'due'

const STORAGE_KEY = 'life.tasksView'
const DEFAULT_VIEW: TaskView = 'List'

const COLUMNS: Array<{ key: ColumnKey; label: string; mark: string }> = [
  { key: 'open', label: 'To do', mark: 'var(--life-label)' },
  { key: 'in_progress', label: 'In progress', mark: 'var(--life-amber)' },
  { key: 'done', label: 'Done', mark: 'var(--life-green)' },
]

const PRI_LABEL: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Med',
  low: 'Low',
}

function readStoredView(): TaskView {
  if (typeof window === 'undefined') return DEFAULT_VIEW
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'List' || stored === 'Board' ? stored : DEFAULT_VIEW
}

function shortDay(localDate: string, timeZone: string) {
  const date = localDateTimeToUtc(localDate, timeZone, 12, 0)
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: 'numeric',
    month: 'short',
  }).formatToParts(date)
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${lookup.day} ${lookup.month}`
}

function dueSortValue(dueLocalDate: string | null, today: string) {
  if (!dueLocalDate) return [2, '9999-99-99'] as const
  if (dueLocalDate === today) return [0, dueLocalDate] as const
  return [1, dueLocalDate] as const
}

function taskComparator(a: TaskRecord, b: TaskRecord, today: string) {
  const [aRank, aDue] = dueSortValue(a.due_local_date, today)
  const [bRank, bDue] = dueSortValue(b.due_local_date, today)
  if (a.status === 'done' && b.status !== 'done') return 1
  if (a.status !== 'done' && b.status === 'done') return -1
  if (aRank !== bRank) return aRank - bRank
  if (aDue !== bDue) return aDue.localeCompare(bDue)
  return a.title.localeCompare(b.title)
}

export function TasksClient({
  tasks,
  today,
  timezone,
  error,
  initialProjectSlug = null,
}: {
  tasks: TaskRecord[]
  today: string
  timezone: string
  error: string | null
  initialProjectSlug?: string | null
}) {
  const router = useRouter()
  const viewport = useViewportMode()
  const [view, setView] = useState<TaskView>(DEFAULT_VIEW)
  const [filter, setFilter] = useState<TaskFilter>('All')
  const [items, setItems] = useState<TaskRecord[]>(tasks)
  const [groupBy, setGroupBy] = useState<DesktopGroup>('status')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    setView(readStoredView())
  }, [])

  useEffect(() => {
    setItems(tasks)
  }, [tasks])

  function handleViewChange(next: TaskView) {
    setView(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore private browsing storage failures.
    }
  }

  async function updateTask(taskId: string, status: TaskStatus) {
    const previous = items
    setItems((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)))
    try {
      await fetchJson(`/api/life/tasks/${taskId}`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      })
      router.refresh()
    } catch {
      setItems(previous)
    }
  }

  async function createTask() {
    const title = newTitle.trim()
    if (!title) return

    const previousTitle = newTitle
    setNewTitle('')

    try {
      await fetchJson('/api/life/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          projectSlug: initialProjectSlug,
          dueLocalDate: filter === 'Today' ? today : null,
        }),
      })
      router.refresh()
    } catch {
      setNewTitle(previousTitle)
    }
  }

  const scopedItems = useMemo(() => {
    let next = [...items]
    if (initialProjectSlug) {
      next = next.filter((task) => (task.project_slug || '') === initialProjectSlug)
    }
    if (filter === 'Today') {
      next = next.filter((task) => task.due_local_date === today)
    }
    return next.sort((left, right) => taskComparator(left, right, today))
  }, [filter, initialProjectSlug, items, today])

  const allCount = initialProjectSlug
    ? items.filter((task) => (task.project_slug || '') === initialProjectSlug).length
    : items.length
  const todayCount = initialProjectSlug
    ? items.filter(
        (task) => (task.project_slug || '') === initialProjectSlug && task.due_local_date === today,
      ).length
    : items.filter((task) => task.due_local_date === today).length

  const title = initialProjectSlug
    ? getProjectLabel(initialProjectSlug) || initialProjectSlug
    : 'Everything on the list'

  const boardCols = COLUMNS.map((column) => {
    const columnItems = scopedItems.filter((task) => task.status === column.key)
    return {
      ...column,
      items: columnItems,
      count: columnItems.length,
      empty: columnItems.length === 0,
    }
  })

  const groupedItems = useMemo(() => {
    if (viewport === 'phone') return []

    if (groupBy === 'status') {
      return [
        { key: 'status-open', label: 'To do', mark: 'var(--life-label)', items: scopedItems.filter((task) => task.status === 'open') },
        {
          key: 'status-progress',
          label: 'In progress',
          mark: 'var(--life-amber)',
          items: scopedItems.filter((task) => task.status === 'in_progress'),
        },
        { key: 'status-done', label: 'Done', mark: 'var(--life-green)', items: scopedItems.filter((task) => task.status === 'done') },
      ].filter((group) => group.items.length > 0)
    }

    if (groupBy === 'project') {
      const order = new Map(
        Array.from(new Set(scopedItems.map((task) => task.project_slug || 'general'))).map((slug, index) => [slug, index]),
      )
      return Array.from(order.keys())
        .map((slug) => ({
          key: `project-${slug}`,
          label: slug === 'general' ? 'General' : getProjectLabel(slug) || slug,
          mark: 'var(--life-label)',
          items: scopedItems.filter((task) => (task.project_slug || 'general') === slug),
        }))
        .filter((group) => group.items.length > 0)
    }

    const dueLabels = Array.from(new Set(scopedItems.map((task) => task.due_local_date || 'none')))
    return dueLabels
      .map((due) => ({
        key: `due-${due}`,
        label:
          due === 'none'
            ? 'No due date'
            : due === today
              ? 'Today'
              : shortDay(due, timezone),
        mark: due === today ? 'var(--life-accent)' : 'var(--life-label)',
        items: scopedItems.filter((task) => (task.due_local_date || 'none') === due),
      }))
      .filter((group) => group.items.length > 0)
  }, [groupBy, scopedItems, timezone, today, viewport])

  const isPhone = viewport === 'phone'
  const rowProjectDisplay = groupBy === 'project' ? 'none' : undefined
  const rowDueDisplay = groupBy === 'due' ? 'none' : undefined

  if (isPhone) {
    return (
      <div style={{ padding: '18px 16px 0' }}>
        <div className="life-page-head">
          <div>
            <p className="eyebrow">Tasks</p>
            <h1>{title}</h1>
          </div>
          <button type="button" className="life-btn primary" onClick={() => router.push('/life')}>
            + New task
          </button>
        </div>

        <div className="life-tasks-toolbar" style={{ paddingBottom: 10 }}>
          <div className="life-tasks-filters">
            <button
              type="button"
              className={`filter-chip${filter === 'All' ? ' is-active' : ''}`}
              onClick={() => setFilter('All')}
            >
              All <span className="chip-count">{allCount}</span>
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
            <button
              type="button"
              className={`segmented-item${view === 'List' ? ' is-active' : ''}`}
              onClick={() => handleViewChange('List')}
            >
              List
            </button>
            <button
              type="button"
              className={`segmented-item${view === 'Board' ? ' is-active' : ''}`}
              onClick={() => handleViewChange('Board')}
            >
              Board
            </button>
          </div>
        </div>

        {error ? <p className="error-text">{error}</p> : null}

        {view === 'List' ? (
          <div className="life-list">
            {scopedItems.map((task) => {
              const isDone = task.status === 'done'
              const project = task.project_slug ? getProjectLabel(task.project_slug) || task.project_slug : 'General'
              const due = task.due_local_date === today ? 'Today' : task.due_local_date ? shortDay(task.due_local_date, timezone) : ''

              return (
                <div className="life-task-row" key={task.id}>
                  <button
                    type="button"
                    className={`life-check${isDone ? ' is-done' : ''}`}
                    onClick={() => updateTask(task.id, isDone ? 'open' : 'done')}
                    style={{ borderRadius: 0 }}
                    aria-label={isDone ? 'Reopen task' : 'Mark task done'}
                  >
                    ✓
                  </button>
                  <div className="life-task-main">
                    <span className={`life-task-title${isDone ? ' is-done' : ''}`}>{task.title}</span>
                  </div>
                  <div className="life-task-meta">
                    <span className="life-tag">{project}</span>
                    <span className="life-row-aside">{due}</span>
                  </div>
                </div>
              )
            })}

            {scopedItems.length === 0 ? <div className="life-empty">Nothing here.</div> : null}
          </div>
        ) : (
          <div className="life-kanban">
            {boardCols.map((column) => (
              <div className="life-kanban-col" key={column.key}>
                <div className="life-kanban-col-head">
                  <span className="col-mark" style={{ background: column.mark }} />
                  <h3>{column.label}</h3>
                  <span className="count-pill">{column.count}</span>
                </div>
                <div className="life-kanban-list">
                  {column.items.map((task) => {
                    const project = task.project_slug ? getProjectLabel(task.project_slug) || task.project_slug : 'General'
                    return (
                      <div className="life-kanban-card" key={task.id}>
                        <div className="life-kanban-card-title">{task.title}</div>
                        <div className="life-kanban-card-meta">
                          <span className="life-tag">{project}</span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
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
                  {column.empty ? <div className="life-kanban-empty">Nothing here.</div> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="life-tasks-shell">
      <div className="life-page-head">
        <div>
          <p className="eyebrow">Tasks</p>
          <h1>{title}</h1>
        </div>
        <button type="button" className="life-btn primary" onClick={() => router.push('/life')}>
          + New task
        </button>
      </div>

      <div className="life-tasks-toolbar">
        <div className="life-tasks-filters">
          <button
            type="button"
            className={`filter-chip${filter === 'All' ? ' is-active' : ''}`}
            onClick={() => setFilter('All')}
          >
            All <span className="chip-count">{allCount}</span>
          </button>
          <button
            type="button"
            className={`filter-chip${filter === 'Today' ? ' is-active' : ''}`}
            onClick={() => setFilter('Today')}
          >
            Today <span className="chip-count">{todayCount}</span>
          </button>
        </div>

        <div className="life-task-toolbar-right">
          <span className="life-task-toolbar-label">Group</span>
          <div className="segmented">
            <button
              type="button"
              className={`segmented-item${groupBy === 'status' ? ' is-active' : ''}`}
              onClick={() => setGroupBy('status')}
            >
              Status
            </button>
            <button
              type="button"
              className={`segmented-item${groupBy === 'project' ? ' is-active' : ''}`}
              onClick={() => setGroupBy('project')}
            >
              Project
            </button>
            <button
              type="button"
              className={`segmented-item${groupBy === 'due' ? ' is-active' : ''}`}
              onClick={() => setGroupBy('due')}
            >
              Due
            </button>
          </div>
          <div className="segmented">
            <button
              type="button"
              className={`segmented-item${view === 'List' ? ' is-active' : ''}`}
              onClick={() => handleViewChange('List')}
            >
              List
            </button>
            <button
              type="button"
              className={`segmented-item${view === 'Board' ? ' is-active' : ''}`}
              onClick={() => handleViewChange('Board')}
            >
              Board
            </button>
          </div>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {view === 'List' ? (
        <div className="life-list">
          <div className="life-list-add">
            <span className="life-list-add-icon">+</span>
            <input
              className="life-list-add-input"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void createTask()
                }
              }}
              placeholder="Add a task and press Enter…"
            />
          </div>

          <div className="life-list-head">
            <span />
            <span className="life-list-head-label">Task</span>
            <span className="life-list-head-label life-list-head-project" style={{ display: rowProjectDisplay }}>
              Project
            </span>
            <span className="life-list-head-label life-list-head-priority">Priority</span>
            <span className="life-list-head-label life-list-head-due" style={{ display: rowDueDisplay }}>
              Due
            </span>
          </div>

          {groupedItems.map((group) => {
            const open = !collapsed[group.key]
            return (
              <div key={group.key}>
                <button
                  type="button"
                  className="life-task-group-toggle"
                  onClick={() =>
                    setCollapsed((current) => ({
                      ...current,
                      [group.key]: !open,
                    }))
                  }
                >
                  <span className="life-task-group-caret">{open ? '▾' : '▸'}</span>
                  <span className="life-task-group-mark" style={{ background: group.mark }} />
                  <span className="life-task-group-label">{group.label}</span>
                  <span className="life-task-group-count">{group.items.length}</span>
                </button>

                {open ? (
                  <div className="life-task-group-body">
                    {group.items.map((task) => {
                      const isDone = task.status === 'done'
                      const project = task.project_slug
                        ? getProjectLabel(task.project_slug) || task.project_slug
                        : 'General'
                      const due =
                        task.due_local_date === today
                          ? 'Today'
                          : task.due_local_date
                            ? shortDay(task.due_local_date, timezone)
                            : ''

                      return (
                        <div className="life-task-row-wrap" key={task.id}>
                          <div className="life-task-row life-task-row-grid">
                            <button
                              type="button"
                              className={`life-check${isDone ? ' is-done' : ''}`}
                              onClick={() => updateTask(task.id, isDone ? 'open' : 'done')}
                              aria-label={isDone ? 'Reopen task' : 'Mark task done'}
                            >
                              ✓
                            </button>
                            <div className="life-task-main-copy">
                              <div className={`life-task-title${isDone ? ' is-done' : ''}`}>{task.title}</div>
                              {task.details ? <div className="life-task-details">{task.details}</div> : null}
                              <div className="life-task-inline-meta">
                                <span className="life-tag">{project}</span>
                                <span className="life-task-grid-priority">
                                  <span className={`pri-dot pri-${task.priority}`} /> {PRI_LABEL[task.priority]}
                                </span>
                                {due ? (
                                  <span className={`life-row-aside${task.due_local_date === today ? ' life-row-aside-today' : ''}`}>
                                    {due}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <span className="life-task-grid-cell life-task-grid-project" style={{ display: rowProjectDisplay }}>
                              <span className="life-tag">{project}</span>
                            </span>
                            <span className="life-task-grid-cell life-task-grid-priority">
                              <span className={`pri-dot pri-${task.priority}`} style={{ marginRight: 6 }} />
                              {PRI_LABEL[task.priority]}
                            </span>
                            <span
                              className={`life-row-aside${task.due_local_date === today ? ' life-row-aside-today' : ''}`}
                              style={{ display: rowDueDisplay, textAlign: 'right' }}
                            >
                              {due}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}

          {groupedItems.length === 0 ? <div className="life-empty">Nothing here.</div> : null}
        </div>
      ) : (
        <div className="life-kanban">
          {boardCols.map((column) => (
            <div className="life-kanban-col" key={column.key}>
              <div className="life-kanban-col-head">
                <span className="col-mark" style={{ background: column.mark }} />
                <h3>{column.label}</h3>
                <span className="count-pill">{column.count}</span>
              </div>
              <div className="life-kanban-list">
                {column.items.map((task) => {
                  const project = task.project_slug ? getProjectLabel(task.project_slug) || task.project_slug : 'General'
                  return (
                    <div className="life-kanban-card" key={task.id}>
                      <div className="life-kanban-card-title">{task.title}</div>
                      <div className="life-kanban-card-meta">
                        <span className="life-tag">{project}</span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
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
                {column.empty ? <div className="life-kanban-empty">Nothing here.</div> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
