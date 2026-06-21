'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useViewportMode } from '@/hooks/useViewportMode'
import { fetchJson } from '@/lib/life/client'
import { LIFE_PROJECTS, getProjectLabel } from '@/lib/life/projects'
import { localDateTimeToUtc } from '@/lib/life/time'
import type { TaskPriority, TaskRecord, TaskStatus } from '@/lib/life/types'

type TaskView = 'List' | 'Board'
type TaskFilter = 'All' | 'Today'
type ColumnKey = 'open' | 'in_progress' | 'done'
type DesktopGroup = 'status' | 'project' | 'due'

type TaskEditFields = {
  title: string
  details: string | null
  project_slug: string | null
  priority: TaskPriority
  due_local_date: string | null
}

const STORAGE_KEY = 'life.tasksView'
const DEFAULT_VIEW: TaskView = 'List'

const COLUMNS: Array<{ key: ColumnKey; label: string; mark: string }> = [
  { key: 'open', label: 'To do', mark: 'var(--life-label)' },
  { key: 'in_progress', label: 'In progress', mark: 'var(--life-amber)' },
  { key: 'done', label: 'Done', mark: 'var(--life-green)' },
]

const PRI_OPTIONS: TaskPriority[] = ['high', 'medium', 'low']
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

function EditForm({
  task,
  onSave,
  onCancel,
  onDelete,
}: {
  task: TaskRecord
  onSave: (fields: TaskEditFields) => Promise<void>
  onCancel: () => void
  onDelete: () => Promise<void>
}) {
  const [title, setTitle] = useState(task.title)
  const [details, setDetails] = useState(task.details || '')
  const [projectSlug, setProjectSlug] = useState(task.project_slug || '')
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [dueLocalDate, setDueLocalDate] = useState(task.due_local_date || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
    titleRef.current?.select()
  }, [])

  async function handleSave() {
    if (!title.trim()) {
      setError('Title required.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await onSave({
        title: title.trim(),
        details: details.trim() || null,
        project_slug: projectSlug || null,
        priority,
        due_local_date: dueLocalDate || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)

    try {
      await onDelete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.')
      setDeleting(false)
    }
  }

  return (
    <div className="life-task-edit" onClick={(event) => event.stopPropagation()}>
      <input
        ref={titleRef}
        type="text"
        className="text-input life-task-edit-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Task title"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            void handleSave()
          }
          if (event.key === 'Escape') {
            event.preventDefault()
            onCancel()
          }
        }}
      />
      <textarea
        className="text-input life-task-edit-details"
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        placeholder="Add details, notes, links…"
        rows={2}
      />
      <div className="life-task-edit-row">
        <select className="text-input" value={projectSlug} onChange={(event) => setProjectSlug(event.target.value)}>
          <option value="">Unassigned</option>
          {LIFE_PROJECTS.map((project) => (
            <option key={project.slug} value={project.slug}>
              {project.name}
            </option>
          ))}
        </select>
        <select className="text-input" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
          {PRI_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {PRI_LABEL[option]}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="text-input"
          value={dueLocalDate}
          onChange={(event) => setDueLocalDate(event.target.value)}
        />
      </div>
      {error ? <span className="error-text">{error}</span> : null}
      <div className="life-task-edit-actions">
        <button type="button" className="primary-button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="secondary-button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button
          type="button"
          className="life-task-delete-btn"
          onClick={() => void handleDelete()}
          disabled={deleting}
          aria-label="Delete task"
        >
          {deleting ? '…' : 'Delete'}
        </button>
      </div>
    </div>
  )
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
  const [editId, setEditId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<ColumnKey | null>(null)
  const [taskActionError, setTaskActionError] = useState<string | null>(null)

  useEffect(() => {
    setView(readStoredView())
  }, [])

  useEffect(() => {
    setItems(tasks)
  }, [tasks])

  useEffect(() => {
    if (editId && !items.some((task) => task.id === editId)) {
      setEditId(null)
    }
  }, [editId, items])

  function handleViewChange(next: TaskView) {
    setView(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore private browsing storage failures.
    }
  }

  async function updateTaskStatus(taskId: string, status: TaskStatus, errorMessage = 'Task update failed.') {
    const previous = items
    setItems((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)))
    setTaskActionError(null)

    try {
      await fetchJson(`/api/life/tasks/${taskId}`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      })
      router.refresh()
    } catch {
      setItems(previous)
      setTaskActionError(errorMessage)
    }
  }

  async function saveEdit(taskId: string, fields: TaskEditFields) {
    await fetchJson(`/api/life/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: fields.title,
        details: fields.details,
        projectSlug: fields.project_slug,
        priority: fields.priority,
        dueLocalDate: fields.due_local_date,
      }),
    })

    setItems((current) => current.map((task) => (task.id === taskId ? { ...task, ...fields } : task)))
    setEditId(null)
    setTaskActionError(null)
    router.refresh()
  }

  async function deleteTask(taskId: string) {
    await fetchJson(`/api/life/tasks/${taskId}`, {
      method: 'POST',
      body: JSON.stringify({ status: 'dismissed' }),
    })

    setItems((current) => current.filter((task) => task.id !== taskId))
    setEditId(null)
    setTaskActionError(null)
    router.refresh()
  }

  async function createTask() {
    const title = newTitle.trim()
    if (!title) return

    const previousTitle = newTitle
    setNewTitle('')
    setTaskActionError(null)

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
      setTaskActionError('Task creation failed.')
    }
  }

  async function moveTask(taskId: string, status: ColumnKey) {
    const task = items.find((entry) => entry.id === taskId)
    if (!task || task.status === status) return
    await updateTaskStatus(taskId, status, 'Failed to move task.')
  }

  function handleDrop(column: ColumnKey) {
    const taskId = dragId
    setDragId(null)
    setDragOverCol(null)
    if (!taskId) return
    void moveTask(taskId, column)
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

  function renderBoard() {
    return (
      <div className="life-kanban">
        {boardCols.map((column) => (
          <div
            className={`life-kanban-col${dragOverCol === column.key ? ' is-dragover' : ''}`}
            key={column.key}
            onDragOver={(event) => {
              event.preventDefault()
              if (dragOverCol !== column.key) {
                setDragOverCol(column.key)
              }
            }}
            onDragLeave={(event) => {
              const nextTarget = event.relatedTarget
              if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
                setDragOverCol((current) => (current === column.key ? null : current))
              }
            }}
            onDrop={(event) => {
              event.preventDefault()
              handleDrop(column.key)
            }}
          >
            <div className="life-kanban-col-head">
              <span className="col-mark" style={{ background: column.mark }} />
              <h3>{column.label}</h3>
              <span className="count-pill">{column.count}</span>
            </div>
            <div className="life-kanban-list">
              {column.items.map((task) => {
                const project = task.project_slug ? getProjectLabel(task.project_slug) || task.project_slug : 'General'

                if (editId === task.id) {
                  return (
                    <div className="life-kanban-card life-kanban-card-editing" key={task.id}>
                      <EditForm
                        task={task}
                        onSave={(fields) => saveEdit(task.id, fields)}
                        onCancel={() => setEditId(null)}
                        onDelete={() => deleteTask(task.id)}
                      />
                    </div>
                  )
                }

                return (
                  <div
                    className={`life-kanban-card${dragId === task.id ? ' is-dragging' : ''}`}
                    key={task.id}
                    draggable
                    onClick={() => setEditId(task.id)}
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
                    {task.details ? <p className="life-task-details">{task.details}</p> : null}
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
                      <button
                        type="button"
                        className="life-kanban-delete"
                        onClick={(event) => {
                          event.stopPropagation()
                          void deleteTask(task.id)
                        }}
                        aria-label="Delete task"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              })}
              {column.empty ? <div className="life-kanban-empty">Nothing here.</div> : null}
            </div>
          </div>
        ))}
      </div>
    )
  }

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
        {taskActionError ? <p className="error-text">{taskActionError}</p> : null}

        {view === 'List' ? (
          <div className="life-list">
            {scopedItems.map((task) => {
              const isDone = task.status === 'done'
              const project = task.project_slug ? getProjectLabel(task.project_slug) || task.project_slug : 'General'
              const due = task.due_local_date === today ? 'Today' : task.due_local_date ? shortDay(task.due_local_date, timezone) : ''

              if (editId === task.id) {
                return (
                  <div className="life-task-row life-task-row-editing" key={task.id}>
                    <EditForm
                      task={task}
                      onSave={(fields) => saveEdit(task.id, fields)}
                      onCancel={() => setEditId(null)}
                      onDelete={() => deleteTask(task.id)}
                    />
                  </div>
                )
              }

              return (
                <div
                  className="life-task-row"
                  key={task.id}
                  onClick={() => setEditId(task.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <button
                    type="button"
                    className={`life-check${isDone ? ' is-done' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      void updateTaskStatus(task.id, isDone ? 'open' : 'done')
                    }}
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
          renderBoard()
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
      {taskActionError ? <p className="error-text">{taskActionError}</p> : null}

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
                          {editId === task.id ? (
                            <div className="life-task-row life-task-row-editing">
                              <EditForm
                                task={task}
                                onSave={(fields) => saveEdit(task.id, fields)}
                                onCancel={() => setEditId(null)}
                                onDelete={() => deleteTask(task.id)}
                              />
                            </div>
                          ) : (
                            <div
                              className="life-task-row life-task-row-grid"
                              onClick={() => setEditId(task.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <button
                                type="button"
                                className={`life-check${isDone ? ' is-done' : ''}`}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  void updateTaskStatus(task.id, isDone ? 'open' : 'done')
                                }}
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
                          )}
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
        renderBoard()
      )}
    </div>
  )
}
