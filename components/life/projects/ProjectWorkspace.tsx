'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { LifeCalendar } from '@/components/life/tasks/LifeCalendar'
import { fetchJson } from '@/lib/life/client'
import type {
  CalendarEventRecord,
  ProjectMilestoneRecord,
  ProjectRecord,
  ProjectRefRecord,
  ProjectStatus,
  TaskLinkedEvent,
  TaskRecord,
} from '@/lib/life/types'
import { ProjectEvents } from './ProjectEvents'
import { ProjectRefs } from './ProjectRefs'
import { ProjectTasks } from './ProjectTasks'
import { healthTone, progressPct, relativeDueLabel, STATUS_LABEL, STATUS_OPTIONS } from './shared'

type Tab = 'tasks' | 'events' | 'refs'

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 }

export function ProjectWorkspace({
  project,
  tasks,
  milestones,
  refs,
  events,
  linkedEvents,
  today,
  timezone,
}: {
  project: ProjectRecord
  tasks: TaskRecord[]
  milestones: ProjectMilestoneRecord[]
  refs: ProjectRefRecord[]
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

  return (
    <div className="life-project-workspace">
      <div className="life-project-back">
        <Link href="/life/projects" className="life-back-link">
          ← Projects
        </Link>
      </div>

      <div className="life-page-head life-project-head">
        <div>
          <p className="eyebrow">
            <span className="life-project-dot" style={{ background: project.color || 'var(--life-label)' }} /> Project
          </p>
          <h1>{project.name}</h1>
          {project.summary ? <p className="life-project-summary-line">{project.summary}</p> : null}
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
      </div>
    </div>
  )
}
