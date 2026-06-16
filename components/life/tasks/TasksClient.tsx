'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { fetchJson } from '@/lib/life/client'
import { LIFE_PROJECTS, getProjectLabel } from '@/lib/life/projects'
import type { TaskRecord, TaskPriority, TaskStatus } from '@/lib/life/types'

type TaskView = 'List' | 'Board'
type TaskFilter = 'All' | 'Today'
type ColumnKey = 'open' | 'in_progress' | 'done'

const STORAGE_KEY = 'life.tasksView'
const DEFAULT_VIEW: TaskView = 'List'
const REDIRECT_TO = '/life/tasks'

const COLUMNS: Array<{ key: ColumnKey; label: string; mark: string }> = [
  { key: 'open', label: 'To do', mark: 'var(--life-label)' },
  { key: 'in_progress', label: 'In progress', mark: 'var(--life-amber)' },
  { key: 'done', label: 'Done', mark: 'var(--life-green)' },
]

const PRI_OPTIONS: TaskPriority[] = ['high', 'medium', 'low']
const PRI_LABEL: Record<TaskPriority, string> = { high: 'High', medium: 'Med', low: 'Low' }

function readStoredView(): TaskView {
  if (typeof window === 'undefined') return DEFAULT_VIEW
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'List' || stored === 'Board' ? stored : DEFAULT_VIEW
}

function EditForm({
  task,
  onSave,
  onCancel,
  onDelete,
}: {
  task: TaskRecord
  onSave: (fields: Partial<TaskRecord>) => Promise<void>
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
    if (!title.trim()) { setError('Title required.'); return }
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
    <div className="life-task-edit">
      <input
        ref={titleRef}
        type="text"
        className="text-input life-task-edit-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }}
      />
      <textarea
        className="text-input life-task-edit-details"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Add details, notes, links…"
        rows={2}
      />
      <div className="life-task-edit-row">
        <select
          className="text-input"
          value={projectSlug}
          onChange={(e) => setProjectSlug(e.target.value)}
        >
          <option value="">Unassigned</option>
          {LIFE_PROJECTS.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>
        <select
          className="text-input"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
        >
          {PRI_OPTIONS.map((p) => (
            <option key={p} value={p}>{PRI_LABEL[p]}</option>
          ))}
        </select>
        <input
          type="date"
          className="text-input"
          value={dueLocalDate}
          onChange={(e) => setDueLocalDate(e.target.value)}
        />
      </div>
      {error ? <span className="error-text">{error}</span> : null}
      <div className="life-task-edit-actions">
        <button type="button" className="primary-button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="secondary-button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button
          type="button"
          className="life-task-delete-btn"
          onClick={handleDelete}
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
  const [editId, setEditId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<ColumnKey | null>(null)
  const [moveError, setMoveError] = useState<string | null>(null)

  useEffect(() => {
    setView(readStoredView())
    setMounted(true)
  }, [])

  useEffect(() => { setItems(tasks) }, [tasks])

  function handleViewChange(next: TaskView) {
    setView(next)
    try { window.localStorage.setItem(STORAGE_KEY, next) } catch { /* private mode */ }
  }

  async function moveTask(taskId: string, status: ColumnKey) {
    const current = items.find((t) => t.id === taskId)
    if (!current || current.status === status) return
    const previous = items
    setItems((list) => list.map((t) => (t.id === taskId ? { ...t, status } : t)))
    setMoveError(null)
    try {
      await fetchJson(`/api/life/tasks/${taskId}`, {
        method: 'POST',
        body: JSON.stringify({ status: status as TaskStatus }),
      })
      router.refresh()
    } catch (err) {
      setItems(previous)
      setMoveError(err instanceof Error ? err.message : 'Failed to move task.')
    }
  }

  async function saveEdit(taskId: string, fields: Partial<TaskRecord>) {
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
    setItems((list) => list.map((t) => (t.id === taskId ? { ...t, ...fields } : t)))
    setEditId(null)
    router.refresh()
  }

  async function deleteTask(taskId: string) {
    await fetchJson(`/api/life/tasks/${taskId}`, {
      method: 'POST',
      body: JSON.stringify({ status: 'dismissed' }),
    })
    setItems((list) => list.filter((t) => t.id !== taskId))
    setEditId(null)
    router.refresh()
  }

  function handleDrop(column: ColumnKey) {
    if (dragId) moveTask(dragId, column)
    setDragId(null)
    setDragOverCol(null)
  }

  const todayCount = items.filter((t) => t.due_local_date === today).length
  const shown = filter === 'All' ? items : items.filter((t) => t.due_local_date === today)

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
          onClick={() => { setAddOpen((o) => !o); setEditId(null) }}
        >
          ＋ New task
        </button>
      </div>

      {addOpen ? (
        <form action="/api/life/tasks" method="post" className="life-add-inline">
          <input type="hidden" name="redirectTo" value={REDIRECT_TO} />
          <input autoFocus required type="text" name="title" placeholder="Task title" className="text-input" />
          <textarea name="details" placeholder="Details or notes (optional)" className="text-input life-task-edit-details" rows={2} />
          <div className="life-add-inline-row">
            <select className="text-input" defaultValue="" name="projectSlug">
              <option value="">Unassigned</option>
              {LIFE_PROJECTS.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name}</option>
              ))}
            </select>
            <select className="text-input" defaultValue="medium" name="priority">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input className="text-input" type="date" name="dueLocalDate" defaultValue="" />
            <button type="submit" className="primary-button">Add</button>
            <button type="button" className="secondary-button" onClick={() => setAddOpen(false)}>Cancel</button>
          </div>
        </form>
      ) : null}

      <div className="life-tasks-toolbar">
        <div className="life-tasks-filters">
          <button type="button" className={`filter-chip${filter === 'All' ? ' is-active' : ''}`} onClick={() => setFilter('All')}>
            All <span className="chip-count">{items.length}</span>
          </button>
          <button type="button" className={`filter-chip${filter === 'Today' ? ' is-active' : ''}`} onClick={() => setFilter('Today')}>
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
            const isEditing = editId === task.id
            const projectLabel = task.project_slug
              ? getProjectLabel(task.project_slug) || task.project_slug
              : null
            const dueLabel = task.due_local_date === today ? 'Today' : task.due_local_date || ''

            if (isEditing) {
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
                onClick={() => { setEditId(task.id); setAddOpen(false) }}
                style={{ cursor: 'pointer' }}
              >
                <form action={`/api/life/tasks/${task.id}`} method="post" onClick={(e) => e.stopPropagation()}>
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
                  <div>
                    <span className={`life-task-title${isDone ? ' is-done' : ''}`}>{task.title}</span>
                    {task.details ? <p className="life-task-details">{task.details}</p> : null}
                  </div>
                </div>
                <div className="life-task-meta">
                  {projectLabel ? <span className="life-tag">{projectLabel}</span> : null}
                  <span className="life-task-pri">
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
            const columnItems = shown.filter((t) => t.status === column.key)
            return (
              <div
                className={`life-kanban-col${dragOverCol === column.key ? ' is-dragover' : ''}`}
                key={column.key}
                onDragOver={(e) => { e.preventDefault(); if (dragOverCol !== column.key) setDragOverCol(column.key) }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol((c) => (c === column.key ? null : c)) }}
                onDrop={() => handleDrop(column.key)}
              >
                <div className="life-kanban-col-head">
                  <span className="col-mark" style={{ background: column.mark }} />
                  <h3>{column.label}</h3>
                  <span className="count-pill">{columnItems.length}</span>
                </div>
                <div className="life-kanban-list">
                  {columnItems.length === 0 ? <div className="life-kanban-empty">Nothing here.</div> : null}
                  {columnItems.map((task) => {
                    const projectLabel = task.project_slug
                      ? getProjectLabel(task.project_slug) || task.project_slug
                      : null
                    return (
                      <div
                        className={`life-kanban-card${dragId === task.id ? ' is-dragging' : ''}`}
                        key={task.id}
                        draggable
                        onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', task.id); setDragId(task.id) }}
                        onDragEnd={() => { setDragId(null); setDragOverCol(null) }}
                      >
                        <div className="life-kanban-card-title">{task.title}</div>
                        {task.details ? <p className="life-task-details" style={{ marginTop: 4 }}>{task.details}</p> : null}
                        <div className="life-kanban-card-meta">
                          {projectLabel ? <span className="life-tag">{projectLabel}</span> : null}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--life-label)' }}>
                            <span className={`pri-dot pri-${task.priority}`} />
                            {PRI_LABEL[task.priority]}
                          </span>
                          <button
                            type="button"
                            className="life-kanban-delete"
                            onClick={() => deleteTask(task.id)}
                            aria-label="Delete task"
                          >
                            ×
                          </button>
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
