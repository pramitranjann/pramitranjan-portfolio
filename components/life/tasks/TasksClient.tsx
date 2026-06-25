'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { LifeCalendar } from '@/components/life/tasks/LifeCalendar'
import { TaskForm } from '@/components/life/tasks/TaskForm'
import { useViewportMode } from '@/hooks/useViewportMode'
import { fetchJson } from '@/lib/life/client'
import { useLifeProjects } from '@/components/life/LifeProjectsProvider'
import { localDateTimeToUtc } from '@/lib/life/time'
import type { TaskDraft, TaskLinkedEvent, TaskPriority, TaskRecord, TaskStatus } from '@/lib/life/types'

type TaskView = 'List' | 'Board'
type TaskFilter = 'All' | 'Today' | 'Upcoming'

function diffDays(dueLocalDate: string, today: string) {
  const [ay, am, ad] = dueLocalDate.split('-').map(Number)
  const [by, bm, bd] = today.split('-').map(Number)
  return Math.round((Date.UTC(ay, am - 1, ad) - Date.UTC(by, bm - 1, bd)) / 86400000)
}

function boardDueLabel(dueLocalDate: string | null, today: string, timeZone: string) {
  if (!dueLocalDate) return null
  const diff = diffDays(dueLocalDate, today)
  let text: string
  let tone: 'overdue' | 'today' | 'soon' | 'normal'
  if (diff < 0) {
    text = `${-diff}d late`
    tone = 'overdue'
  } else if (diff === 0) {
    text = 'Today'
    tone = 'today'
  } else if (diff === 1) {
    text = 'Tomorrow'
    tone = 'soon'
  } else if (diff <= 6) {
    text = localDateTimeToUtc(dueLocalDate, timeZone, 12, 0).toLocaleDateString('en-GB', { timeZone, weekday: 'short' })
    tone = 'soon'
  } else {
    text = shortDay(dueLocalDate, timeZone)
    tone = 'normal'
  }
  return { text, tone }
}
type ColumnKey = 'open' | 'in_progress' | 'done'
type DesktopGroup = 'smart' | 'project' | 'status'

type TaskGroup = {
  key: string
  label: string
  mark: string
  items: TaskRecord[]
  defaultCollapsed?: boolean
  dim?: boolean
}

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

function EditForm({
  task,
  today,
  timezone,
  linkedEventLabel,
  onSave,
  onCancel,
  onDelete,
}: {
  task: TaskRecord
  today: string
  timezone: string
  linkedEventLabel?: string | null
  onSave: (draft: TaskDraft) => Promise<void>
  onCancel: () => void
  onDelete: () => Promise<void>
}) {
  return (
    <TaskForm
      mode="edit"
      today={today}
      timezone={timezone}
      initial={{
        title: task.title,
        details: task.details,
        projectSlug: task.project_slug,
        priority: task.priority,
        dueLocalDate: task.due_local_date,
        calendarEventId: task.calendar_event_id,
      }}
      linkedEventLabel={linkedEventLabel}
      onSubmit={onSave}
      onCancel={onCancel}
      onDelete={onDelete}
      LifeCalendarComponent={LifeCalendar}
    />
  )
}

function NewTaskComposer({
  today,
  timezone,
  defaultProjectSlug,
  defaultDue,
  onCreate,
  onClose,
}: {
  today: string
  timezone: string
  defaultProjectSlug: string
  defaultDue: string
  onCreate: (draft: TaskDraft) => Promise<void>
  onClose: () => void
}) {
  return (
    <TaskForm
      mode="create"
      today={today}
      timezone={timezone}
      initial={{ projectSlug: defaultProjectSlug || null, dueLocalDate: defaultDue || null }}
      onSubmit={onCreate}
      onCancel={onClose}
      resetOnSubmit
      LifeCalendarComponent={LifeCalendar}
    />
  )
}

export function TasksClient({
  tasks,
  today,
  timezone,
  error,
  initialProjectSlug = null,
  linkedEvents = {},
}: {
  tasks: TaskRecord[]
  today: string
  timezone: string
  error: string | null
  initialProjectSlug?: string | null
  linkedEvents?: Record<string, TaskLinkedEvent>
}) {
  const router = useRouter()
  const { colorFor, labelFor, tintFor } = useLifeProjects()
  const viewport = useViewportMode()
  const [view, setView] = useState<TaskView>(DEFAULT_VIEW)
  const [filter, setFilter] = useState<TaskFilter>('All')
  const [items, setItems] = useState<TaskRecord[]>(tasks)
  const [groupBy, setGroupBy] = useState<DesktopGroup>('smart')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [composerCol, setComposerCol] = useState<ColumnKey | null>(null)
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

  // Board adds inline in the "To do" column; List uses the top composer.
  function handleNewTask() {
    if (view === 'Board') setComposerCol((current) => (current ? null : 'open'))
    else setAdding((value) => !value)
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

  async function saveEdit(taskId: string, draft: TaskDraft) {
    await fetchJson(`/api/life/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: draft.title,
        details: draft.details,
        projectSlug: draft.projectSlug,
        priority: draft.priority,
        dueLocalDate: draft.dueLocalDate,
        calendar: draft.calendar,
      }),
    })

    setItems((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              title: draft.title,
              details: draft.details,
              project_slug: draft.projectSlug,
              priority: draft.priority,
              due_local_date: draft.dueLocalDate,
            }
          : task,
      ),
    )
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

  async function createTaskFromComposer(draft: TaskDraft, status: TaskStatus = 'open') {
    await fetchJson('/api/life/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: draft.title,
        details: draft.details,
        projectSlug: draft.projectSlug,
        priority: draft.priority,
        dueLocalDate: draft.dueLocalDate,
        status,
        calendar: draft.calendar,
      }),
    })

    setTaskActionError(null)
    router.refresh()
  }

  function eventChipFor(task: TaskRecord) {
    if (!task.calendar_event_id) return null
    const event = linkedEvents[task.calendar_event_id]
    const label = event
      ? event.allDay || !event.startTime
        ? '📅 Event'
        : `📅 ${new Date(event.startTime).toLocaleTimeString('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit' })}`
      : '🔗 Linked'
    return <span className="life-ev-chip">{label}</span>
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
    } else if (filter === 'Upcoming') {
      next = next.filter((task) => task.due_local_date != null && task.due_local_date > today)
    }
    return next.sort((left, right) => taskComparator(left, right, today))
  }, [filter, initialProjectSlug, items, today])

  const projectScoped = useMemo(
    () => (initialProjectSlug ? items.filter((task) => (task.project_slug || '') === initialProjectSlug) : items),
    [initialProjectSlug, items],
  )
  const allCount = projectScoped.length
  const todayCount = projectScoped.filter((task) => task.due_local_date === today).length
  const upcomingCount = projectScoped.filter((task) => task.due_local_date != null && task.due_local_date > today).length

  // Header summary: due today / still open / overdue.
  const activeItems = projectScoped.filter((task) => task.status !== 'done')
  const dueTodayCount = activeItems.filter((task) => task.due_local_date === today).length
  const openCount = activeItems.length
  const overdueCount = activeItems.filter((task) => task.due_local_date != null && task.due_local_date < today).length

  const title = initialProjectSlug
    ? labelFor(initialProjectSlug)
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

  const groupedItems = useMemo<TaskGroup[]>(() => {
    if (viewport === 'phone') return []

    // Smart: time-sectioned by due date, with Done pulled out at the end.
    if (groupBy === 'smart') {
      const overdue: TaskRecord[] = []
      const todayItems: TaskRecord[] = []
      const upcoming: TaskRecord[] = []
      const someday: TaskRecord[] = []
      const done: TaskRecord[] = []
      for (const task of scopedItems) {
        if (task.status === 'done') {
          done.push(task)
        } else if (!task.due_local_date) {
          someday.push(task)
        } else if (task.due_local_date < today) {
          overdue.push(task)
        } else if (task.due_local_date === today) {
          todayItems.push(task)
        } else {
          upcoming.push(task)
        }
      }
      return [
        { key: 'smart-overdue', label: 'Overdue', mark: 'var(--life-danger)', items: overdue },
        { key: 'smart-today', label: 'Today', mark: 'var(--life-accent)', items: todayItems },
        { key: 'smart-upcoming', label: 'Upcoming', mark: 'var(--life-amber)', items: upcoming },
        { key: 'smart-someday', label: 'Someday', mark: 'var(--life-label)', items: someday },
        { key: 'smart-done', label: 'Done', mark: 'var(--life-green)', items: done, defaultCollapsed: true, dim: true },
      ].filter((group) => group.items.length > 0)
    }

    if (groupBy === 'project') {
      const order = new Map(
        Array.from(new Set(scopedItems.map((task) => task.project_slug || 'general'))).map((slug, index) => [slug, index]),
      )
      return Array.from(order.keys())
        .map((slug) => ({
          key: `project-${slug}`,
          label: slug === 'general' ? 'General' : labelFor(slug) || slug,
          mark: 'var(--life-label)',
          items: scopedItems.filter((task) => (task.project_slug || 'general') === slug),
        }))
        .filter((group) => group.items.length > 0)
    }

    return [
      { key: 'status-open', label: 'To do', mark: 'var(--life-label)', items: scopedItems.filter((task) => task.status === 'open') },
      {
        key: 'status-progress',
        label: 'In progress',
        mark: 'var(--life-amber)',
        items: scopedItems.filter((task) => task.status === 'in_progress'),
      },
      {
        key: 'status-done',
        label: 'Done',
        mark: 'var(--life-green)',
        items: scopedItems.filter((task) => task.status === 'done'),
        defaultCollapsed: true,
        dim: true,
      },
    ].filter((group) => group.items.length > 0)
  }, [groupBy, scopedItems, today, viewport])

  const isPhone = viewport === 'phone'
  const showRowProject = groupBy !== 'project'

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
              <button
                type="button"
                className="life-kanban-col-add"
                aria-label={`Add task to ${column.label}`}
                onClick={() => setComposerCol((current) => (current === column.key ? null : column.key))}
              >
                +
              </button>
            </div>
            <div className="life-kanban-list">
              {composerCol === column.key ? (
                <div className="life-kanban-card life-kanban-card-editing">
                  <NewTaskComposer
                    today={today}
                    timezone={timezone}
                    onCreate={(draft) => createTaskFromComposer(draft, column.key)}
                    onClose={() => setComposerCol(null)}
                    defaultProjectSlug={initialProjectSlug || ''}
                    defaultDue={filter === 'Today' ? today : ''}
                  />
                </div>
              ) : null}
              {column.items.map((task) => {
                const project = task.project_slug ? labelFor(task.project_slug) : 'General'

                if (editId === task.id) {
                  return (
                    <div className="life-kanban-card life-kanban-card-editing" key={task.id}>
                      <EditForm
                        task={task}
                        today={today}
                        timezone={timezone}
                        linkedEventLabel={task.calendar_event_id ? linkedEvents[task.calendar_event_id]?.title : null}
                        onSave={(draft) => saveEdit(task.id, draft)}
                        onCancel={() => setEditId(null)}
                        onDelete={() => deleteTask(task.id)}
                      />
                    </div>
                  )
                }

                const isDone = task.status === 'done'
                const cardDue = boardDueLabel(task.due_local_date, today, timezone)
                return (
                  <div
                    className={`life-kanban-card${isDone ? ' is-done' : ''}${dragId === task.id ? ' is-dragging' : ''}`}
                    key={task.id}
                    draggable
                    style={{ borderLeftColor: colorFor(task.project_slug) }}
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
                      <span className="life-tag" style={tintFor(task.project_slug)}>{project}</span>
                      <span className={`life-kanban-pri pri-chip-${task.priority}`}>
                        <span className={`pri-dot pri-${task.priority}`} />
                        {PRI_LABEL[task.priority]}
                      </span>
                      {eventChipFor(task)}
                      {cardDue ? <span className={`life-due-chip due-${cardDue.tone}`}>{cardDue.text}</span> : null}
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
            {allCount > 0 ? (
              <p className="life-tasks-stat">
                <b>{dueTodayCount} due today</b> · {openCount} open · {overdueCount} overdue
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="life-btn primary"
            onClick={handleNewTask}
            aria-expanded={adding || composerCol !== null}
          >
            + New task
          </button>
        </div>

        {adding && view === 'List' ? (
          <NewTaskComposer
            today={today}
            timezone={timezone}
            onCreate={(draft) => createTaskFromComposer(draft, 'open')}
            onClose={() => setAdding(false)}
            defaultProjectSlug={initialProjectSlug || ''}
            defaultDue={filter === 'Today' ? today : ''}
          />
        ) : null}

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
            <button
              type="button"
              className={`filter-chip${filter === 'Upcoming' ? ' is-active' : ''}`}
              onClick={() => setFilter('Upcoming')}
            >
              Upcoming <span className="chip-count">{upcomingCount}</span>
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
              const project = task.project_slug ? labelFor(task.project_slug) : 'General'
              const due = task.due_local_date === today ? 'Today' : task.due_local_date ? shortDay(task.due_local_date, timezone) : ''

              if (editId === task.id) {
                return (
                  <div className="life-task-row life-task-row-editing" key={task.id}>
                    <EditForm
                      task={task}
                      today={today}
                      timezone={timezone}
                      linkedEventLabel={task.calendar_event_id ? linkedEvents[task.calendar_event_id]?.title : null}
                      onSave={(draft) => saveEdit(task.id, draft)}
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
    <div className={`life-tasks-shell${view === 'Board' ? ' is-board' : ''}`}>
      <div className="life-page-head">
        <div>
          <p className="eyebrow">Tasks</p>
          <h1>{title}</h1>
          {allCount > 0 ? (
            <p className="life-tasks-stat">
              <b>{dueTodayCount} due today</b> · {openCount} open · {overdueCount} overdue
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="life-btn primary"
          onClick={handleNewTask}
          aria-expanded={adding || composerCol !== null}
        >
          + New task
        </button>
      </div>

      {adding && view === 'List' ? (
        <NewTaskComposer
          today={today}
          timezone={timezone}
          onCreate={(draft) => createTaskFromComposer(draft, 'open')}
          onClose={() => setAdding(false)}
          defaultProjectSlug={initialProjectSlug || ''}
          defaultDue={filter === 'Today' ? today : ''}
        />
      ) : null}

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
          <button
            type="button"
            className={`filter-chip${filter === 'Upcoming' ? ' is-active' : ''}`}
            onClick={() => setFilter('Upcoming')}
          >
            Upcoming <span className="chip-count">{upcomingCount}</span>
          </button>
        </div>

        <div className="life-task-toolbar-right">
          <span className="life-task-toolbar-label">Group</span>
          <div className="segmented">
            <button
              type="button"
              className={`segmented-item${groupBy === 'smart' ? ' is-active' : ''}`}
              onClick={() => setGroupBy('smart')}
            >
              Smart
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
              className={`segmented-item${groupBy === 'status' ? ' is-active' : ''}`}
              onClick={() => setGroupBy('status')}
            >
              Status
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

          {groupedItems.map((group) => {
            const open = !(collapsed[group.key] ?? group.defaultCollapsed ?? false)
            return (
              <div key={group.key}>
                <button
                  type="button"
                  className="life-task-group-toggle"
                  onClick={() =>
                    setCollapsed((current) => ({
                      ...current,
                      [group.key]: open,
                    }))
                  }
                >
                  <span className="life-task-group-caret">{open ? '▾' : '▸'}</span>
                  <span className="life-task-group-mark" style={{ background: group.mark }} />
                  <span className="life-task-group-label">{group.label}</span>
                  <span className="life-task-group-count">{group.items.length}</span>
                  <span className="life-task-group-rule" />
                </button>

                {open ? (
                  <div className={`life-task-group-body${group.dim ? ' is-dim' : ''}`}>
                    {group.items.map((task) => {
                      const isDone = task.status === 'done'
                      const project = task.project_slug
                        ? labelFor(task.project_slug)
                        : 'General'
                      const cardDue = boardDueLabel(task.due_local_date, today, timezone)

                      if (editId === task.id) {
                        return (
                          <div className="life-task-row life-task-row-editing" key={task.id}>
                            <EditForm
                              task={task}
                              today={today}
                              timezone={timezone}
                              linkedEventLabel={task.calendar_event_id ? linkedEvents[task.calendar_event_id]?.title : null}
                              onSave={(draft) => saveEdit(task.id, draft)}
                              onCancel={() => setEditId(null)}
                              onDelete={() => deleteTask(task.id)}
                            />
                          </div>
                        )
                      }

                      return (
                        <div
                          className={`life-list-row pri-edge-${task.priority}${isDone ? ' is-done' : ''}`}
                          key={task.id}
                          onClick={() => setEditId(task.id)}
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
                          <div className="life-list-row-body">
                            <div className={`life-task-title${isDone ? ' is-done' : ''}`}>{task.title}</div>
                            {task.details ? <div className="life-task-details">{task.details}</div> : null}
                          </div>
                          <div className="life-list-row-meta">
                            {showRowProject ? (
                              <span className="life-tag" style={tintFor(task.project_slug)}>
                                {project}
                              </span>
                            ) : null}
                            {eventChipFor(task)}
                            {cardDue ? (
                              <span className={`life-due-chip${isDone ? '' : ` due-${cardDue.tone}`}`}>{cardDue.text}</span>
                            ) : null}
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
        renderBoard()
      )}
    </div>
  )
}
