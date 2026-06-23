'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { LifeCalendar } from '@/components/life/tasks/LifeCalendar'
import { TaskForm } from '@/components/life/tasks/TaskForm'
import { fetchJson } from '@/lib/life/client'
import type {
  ProjectMilestoneRecord,
  TaskDraft,
  TaskLinkedEvent,
  TaskPriority,
  TaskRecord,
  TaskStatus,
} from '@/lib/life/types'
import { progressPct, relativeDueLabel } from './shared'

const PRI_LABEL: Record<TaskPriority, string> = { high: 'High', medium: 'Med', low: 'Low' }
const BACKLOG = '__backlog__'

export function ProjectTasks({
  projectSlug,
  tasks,
  milestones,
  linkedEvents,
  today,
  timezone,
}: {
  projectSlug: string
  tasks: TaskRecord[]
  milestones: ProjectMilestoneRecord[]
  linkedEvents: Record<string, TaskLinkedEvent>
  today: string
  timezone: string
}) {
  const router = useRouter()
  const [items, setItems] = useState<TaskRecord[]>(tasks)
  const [composer, setComposer] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [moveMenu, setMoveMenu] = useState<string | null>(null)
  const [addingMilestone, setAddingMilestone] = useState(false)
  const [milestoneName, setMilestoneName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setItems(tasks)
  }, [tasks])

  const groups = useMemo(() => {
    const realGroups = milestones.map((milestone) => ({
      key: milestone.id,
      name: milestone.name,
      targetDate: milestone.target_date,
      isBacklog: false,
      items: items.filter((task) => task.milestone_id === milestone.id),
    }))
    const backlog = {
      key: BACKLOG,
      name: 'Backlog',
      targetDate: null as string | null,
      isBacklog: true,
      items: items.filter((task) => !task.milestone_id),
    }
    return [...realGroups, backlog]
  }, [items, milestones])

  async function createTask(draft: TaskDraft, milestoneId: string | null) {
    await fetchJson('/api/life/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: draft.title,
        details: draft.details,
        projectSlug,
        priority: draft.priority,
        dueLocalDate: draft.dueLocalDate,
        calendar: draft.calendar,
        milestoneId,
        status: 'open',
      }),
    })
    setError(null)
    router.refresh()
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
    setEditId(null)
    router.refresh()
  }

  async function toggleDone(task: TaskRecord) {
    const next: TaskStatus = task.status === 'done' ? 'open' : 'done'
    const previous = items
    setItems((current) => current.map((entry) => (entry.id === task.id ? { ...entry, status: next } : entry)))
    try {
      await fetchJson(`/api/life/tasks/${task.id}`, { method: 'POST', body: JSON.stringify({ status: next }) })
      router.refresh()
    } catch {
      setItems(previous)
      setError('Failed to update task.')
    }
  }

  async function deleteTask(taskId: string) {
    setItems((current) => current.filter((entry) => entry.id !== taskId))
    try {
      await fetchJson(`/api/life/tasks/${taskId}`, { method: 'POST', body: JSON.stringify({ status: 'dismissed' }) })
      router.refresh()
    } catch {
      setError('Failed to delete task.')
      router.refresh()
    }
  }

  async function moveTask(taskId: string, milestoneId: string | null) {
    setMoveMenu(null)
    setItems((current) => current.map((entry) => (entry.id === taskId ? { ...entry, milestone_id: milestoneId } : entry)))
    try {
      await fetchJson(`/api/life/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify({ milestoneId }) })
      router.refresh()
    } catch {
      setError('Failed to move task.')
      router.refresh()
    }
  }

  async function createMilestone() {
    const name = milestoneName.trim()
    if (!name) return
    try {
      await fetchJson(`/api/life/projects/${projectSlug}/milestones`, { method: 'POST', body: JSON.stringify({ name }) })
      setMilestoneName('')
      setAddingMilestone(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add phase.')
    }
  }

  async function deleteMilestone(id: string, name: string) {
    if (!window.confirm(`Delete phase "${name}"? Its tasks move to the backlog.`)) return
    try {
      await fetchJson(`/api/life/projects/${projectSlug}/milestones/${id}`, { method: 'DELETE' })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete phase.')
    }
  }

  return (
    <div className="life-project-tasks">
      <div className="life-project-tasks-toolbar">
        {addingMilestone ? (
          <div className="life-milestone-add">
            <input
              className="life-list-add-input"
              autoFocus
              value={milestoneName}
              placeholder="Phase name (e.g. Research, Launch)…"
              onChange={(event) => setMilestoneName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void createMilestone()
                }
                if (event.key === 'Escape') setAddingMilestone(false)
              }}
            />
            <button type="button" className="life-btn primary" onClick={() => void createMilestone()}>
              Add phase
            </button>
            <button type="button" className="life-btn ghost" onClick={() => setAddingMilestone(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="life-btn ghost" onClick={() => setAddingMilestone(true)}>
            + Add phase
          </button>
        )}
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {groups.map((group) => {
        if (group.isBacklog && group.items.length === 0 && groups.length > 1) return null
        const groupDone = group.items.filter((task) => task.status === 'done').length
        const pct = progressPct(groupDone, group.items.length)
        const groupDue = relativeDueLabel(group.targetDate, today)
        return (
          <section className="life-milestone" key={group.key}>
            <div className="life-milestone-head">
              <span className="life-milestone-name">{group.name}</span>
              {groupDue ? <span className={`life-due-chip due-${groupDue.tone}`}>{groupDue.text}</span> : null}
              <span className="life-milestone-count">
                {groupDone}/{group.items.length}
              </span>
              <div className="life-milestone-bar">
                <div className="life-progress-track">
                  <div className="life-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <button
                type="button"
                className="life-milestone-add-btn"
                aria-label={`Add task to ${group.name}`}
                onClick={() => setComposer((current) => (current === group.key ? null : group.key))}
              >
                +
              </button>
              {!group.isBacklog ? (
                <button
                  type="button"
                  className="life-milestone-delete"
                  aria-label={`Delete phase ${group.name}`}
                  onClick={() => void deleteMilestone(group.key, group.name)}
                >
                  ×
                </button>
              ) : null}
            </div>

            {composer === group.key ? (
              <div className="life-milestone-composer">
                <TaskForm
                  mode="create"
                  today={today}
                  timezone={timezone}
                  initial={{ projectSlug }}
                  onSubmit={(draft) => createTask(draft, group.isBacklog ? null : group.key)}
                  onCancel={() => setComposer(null)}
                  resetOnSubmit
                  LifeCalendarComponent={LifeCalendar}
                />
              </div>
            ) : null}

            <div className="life-list life-milestone-list">
              {group.items.length === 0 && composer !== group.key ? (
                <div className="life-empty">Nothing here yet.</div>
              ) : null}
              {group.items.map((task) => {
                const isDone = task.status === 'done'
                const taskDue = relativeDueLabel(task.due_local_date, today)
                const linked = task.calendar_event_id ? linkedEvents[task.calendar_event_id] : null

                if (editId === task.id) {
                  return (
                    <div className="life-task-row life-task-row-editing" key={task.id}>
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
                        linkedEventLabel={linked?.title}
                        onSubmit={(draft) => saveEdit(task.id, draft)}
                        onCancel={() => setEditId(null)}
                        onDelete={() => deleteTask(task.id)}
                        LifeCalendarComponent={LifeCalendar}
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
                      style={{ borderRadius: 0 }}
                      aria-label={isDone ? 'Reopen task' : 'Mark task done'}
                      onClick={(event) => {
                        event.stopPropagation()
                        void toggleDone(task)
                      }}
                    >
                      ✓
                    </button>
                    <div className="life-list-row-body">
                      <div className={`life-task-title${isDone ? ' is-done' : ''}`}>{task.title}</div>
                      {task.details ? <div className="life-task-details">{task.details}</div> : null}
                    </div>
                    <div className="life-list-row-meta">
                      <span className="life-kanban-pri">
                        <span className={`pri-dot pri-${task.priority}`} /> {PRI_LABEL[task.priority]}
                      </span>
                      {linked ? <span className="life-ev-chip">📅</span> : null}
                      {taskDue ? <span className={`life-due-chip${isDone ? '' : ` due-${taskDue.tone}`}`}>{taskDue.text}</span> : null}
                      <div className="life-move-wrap" onClick={(event) => event.stopPropagation()}>
                        <button
                          type="button"
                          className="life-move-btn"
                          aria-label="Move to phase"
                          onClick={() => setMoveMenu((current) => (current === task.id ? null : task.id))}
                        >
                          ⇄
                        </button>
                        {moveMenu === task.id ? (
                          <div className="life-pill-menu open life-move-menu">
                            {milestones.map((milestone) => (
                              <button
                                key={milestone.id}
                                type="button"
                                className="life-pill-menu-item"
                                onClick={() => void moveTask(task.id, milestone.id)}
                              >
                                {milestone.name}
                              </button>
                            ))}
                            <div className="life-pill-menu-sep" />
                            <button type="button" className="life-pill-menu-item" onClick={() => void moveTask(task.id, null)}>
                              Backlog
                            </button>
                          </div>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="life-kanban-delete"
                        aria-label="Delete task"
                        onClick={(event) => {
                          event.stopPropagation()
                          void deleteTask(task.id)
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
