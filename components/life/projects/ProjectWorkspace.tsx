'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { LifeCalendar } from '@/components/life/tasks/LifeCalendar'
import { fetchJson } from '@/lib/life/client'
import type {
  CalendarEventRecord,
  ProjectMilestoneRecord,
  ProjectPageRecord,
  ProjectRecord,
  ProjectRefRecord,
  ProjectStatus,
  TaskLinkedEvent,
  TaskRecord,
} from '@/lib/life/types'
import { ProjectEvents } from './ProjectEvents'
import { ProjectPages } from './ProjectPages'
import { ProjectRefs } from './ProjectRefs'
import { ProjectTasks } from './ProjectTasks'
import { healthTone, progressPct, relativeDueLabel, STATUS_LABEL, STATUS_OPTIONS } from './shared'

type Tab = 'tasks' | 'events' | 'refs' | 'pages'

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 }

export function ProjectWorkspace({
  project,
  tasks,
  milestones,
  refs,
  pages,
  parentProject,
  subprojects,
  events,
  linkedEvents,
  today,
  timezone,
}: {
  project: ProjectRecord
  tasks: TaskRecord[]
  milestones: ProjectMilestoneRecord[]
  refs: ProjectRefRecord[]
  pages: ProjectPageRecord[]
  parentProject: ProjectRecord | null
  subprojects: ProjectRecord[]
  events: CalendarEventRecord[]
  linkedEvents: Record<string, TaskLinkedEvent>
  today: string
  timezone: string
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('tasks')
  const [status, setStatus] = useState<ProjectStatus>(project.status)
  const [targetDate, setTargetDate] = useState<string | null>(project.target_date)
  const [calOpen, setCalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dateBtnRef = useRef<HTMLButtonElement>(null)

  // Inline name / summary editing.
  const [name, setName] = useState(project.name)
  const [summary, setSummary] = useState(project.summary || '')
  const [editName, setEditName] = useState(false)
  const [editSummary, setEditSummary] = useState(false)

  const open = tasks.filter((task) => task.status !== 'done')
  const done = tasks.filter((task) => task.status === 'done')
  const overdue = open.filter((task) => task.due_local_date != null && task.due_local_date < today)
  const pct = progressPct(done.length, tasks.length)
  const tone = healthTone({ status, open: open.length, overdue: overdue.length, total: tasks.length })
  const due = relativeDueLabel(targetDate, today)

  // The single most pressing open task: priority first, then soonest due.
  const nextAction = useMemo(() => {
    return [...open].sort((a, b) => {
      const pr = (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1)
      if (pr !== 0) return pr
      const ad = a.due_local_date || '9999-99-99'
      const bd = b.due_local_date || '9999-99-99'
      return ad.localeCompare(bd)
    })[0]
  }, [open])

  async function patchProject(patch: Record<string, unknown>) {
    setError(null)
    try {
      await fetchJson(`/api/life/projects/${project.slug}`, { method: 'PATCH', body: JSON.stringify(patch) })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed.')
    }
  }

  function changeStatus(next: ProjectStatus) {
    setStatus(next)
    void patchProject({ status: next })
  }

  function changeTargetDate(next: string | null) {
    setTargetDate(next)
    setCalOpen(false)
    void patchProject({ targetDate: next })
  }

  function saveName() {
    setEditName(false)
    const trimmed = name.trim()
    if (!trimmed || trimmed === project.name) {
      setName(project.name)
      return
    }
    void patchProject({ name: trimmed })
  }

  function saveSummary() {
    setEditSummary(false)
    if (summary.trim() === (project.summary || '')) return
    void patchProject({ summary: summary.trim() || null })
  }

  return (
    <div className="life-project-workspace">
      <div className="life-project-back">
        <Link href="/life/projects" className="life-back-link">
          ← Projects
        </Link>
        {parentProject ? (
          <Link href={`/life/projects/${parentProject.slug}`} className="life-back-link">
            ← {parentProject.name}
          </Link>
        ) : null}
      </div>

      <div className="life-page-head life-project-head">
        <div>
          <p className="eyebrow">
            <span className="life-project-dot" style={{ background: project.color || 'var(--life-label)' }} /> Project
          </p>
          {editName ? (
            <input
              className="life-project-name-input"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={saveName}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  saveName()
                }
                if (event.key === 'Escape') {
                  setName(project.name)
                  setEditName(false)
                }
              }}
            />
          ) : (
            <h1 className="life-project-name-edit" onClick={() => setEditName(true)} title="Click to rename">
              {name}
            </h1>
          )}
          {editSummary ? (
            <textarea
              className="life-project-summary-input"
              autoFocus
              rows={2}
              value={summary}
              placeholder="Add a summary…"
              onChange={(event) => setSummary(event.target.value)}
              onBlur={saveSummary}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setSummary(project.summary || '')
                  setEditSummary(false)
                }
              }}
            />
          ) : (
            <p className="life-project-summary-line life-project-summary-edit" onClick={() => setEditSummary(true)} title="Click to edit">
              {summary || <span className="life-project-summary-empty">Add a summary…</span>}
            </p>
          )}
          <p className="life-tasks-stat">
            <b>{open.length} open</b>
            {overdue.length > 0 ? <> · {overdue.length} overdue</> : null} · {done.length} done
          </p>
        </div>
        <div className="life-project-head-controls">
          <span className={`life-health-dot health-${tone}`} aria-label={`Health: ${tone}`} />
          <div className="segmented">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`segmented-item${status === option ? ' is-active' : ''}`}
                onClick={() => changeStatus(option)}
              >
                {STATUS_LABEL[option]}
              </button>
            ))}
          </div>
          <button ref={dateBtnRef} type="button" className="life-pill" onClick={() => setCalOpen((value) => !value)}>
            <span className="ic">◷</span>
            <span className="lbl">{due ? due.text : 'Deadline'}</span>
          </button>
        </div>
      </div>

      {calOpen ? (
        <LifeCalendar
          value={targetDate}
          onChange={changeTargetDate}
          onClose={() => setCalOpen(false)}
          anchorRect={dateBtnRef.current?.getBoundingClientRect() ?? null}
        />
      ) : null}

      <div className="life-project-progress-bar">
        <div className="life-progress-track">
          <div className="life-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="life-progress-label">
          {done.length}/{tasks.length} done · {pct}%
        </span>
      </div>

      {nextAction ? (
        <div className="life-next-action">
          <span className="life-next-action-label">Next action</span>
          <span className={`pri-dot pri-${nextAction.priority}`} />
          <span className="life-next-action-title">{nextAction.title}</span>
          {nextAction.due_local_date ? (
            <span className={`life-due-chip due-${nextAction.due_local_date < today ? 'overdue' : nextAction.due_local_date === today ? 'today' : 'soon'}`}>
              {relativeDueLabel(nextAction.due_local_date, today)?.text}
            </span>
          ) : null}
        </div>
      ) : null}

      {subprojects.length > 0 ? (
        <div className="life-project-children">
          <div className="life-project-children-head">
            <span className="eyebrow">Sub-projects</span>
            <span className="life-project-children-count">{subprojects.length}</span>
          </div>
          <div className="life-project-children-grid">
            {subprojects.map((child) => (
              <Link key={child.slug} href={`/life/projects/${child.slug}`} className="life-project-child-card">
                <span className="life-project-dot" style={{ background: child.color || 'var(--life-label)' }} />
                <span className="life-project-child-name">{child.name}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}

      <div className="life-project-tabs">
        <button type="button" className={`life-project-tab${tab === 'tasks' ? ' is-active' : ''}`} onClick={() => setTab('tasks')}>
          Tasks <span className="chip-count">{tasks.length}</span>
        </button>
        <button type="button" className={`life-project-tab${tab === 'events' ? ' is-active' : ''}`} onClick={() => setTab('events')}>
          Events <span className="chip-count">{events.length}</span>
        </button>
        <button type="button" className={`life-project-tab${tab === 'refs' ? ' is-active' : ''}`} onClick={() => setTab('refs')}>
          References <span className="chip-count">{refs.length}</span>
        </button>
        <button type="button" className={`life-project-tab${tab === 'pages' ? ' is-active' : ''}`} onClick={() => setTab('pages')}>
          Pages <span className="chip-count">{pages.length}</span>
        </button>
      </div>

      <div className="life-project-tab-body">
        {tab === 'tasks' ? (
          <ProjectTasks
            projectSlug={project.slug}
            tasks={tasks}
            milestones={milestones}
            linkedEvents={linkedEvents}
            today={today}
            timezone={timezone}
          />
        ) : null}
        {tab === 'events' ? (
          <ProjectEvents projectSlug={project.slug} events={events} today={today} timezone={timezone} />
        ) : null}
        {tab === 'refs' ? <ProjectRefs projectSlug={project.slug} refs={refs} /> : null}
        {tab === 'pages' ? <ProjectPages projectSlug={project.slug} pages={pages} /> : null}
      </div>
    </div>
  )
}
