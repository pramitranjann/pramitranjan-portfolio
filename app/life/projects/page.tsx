import Link from 'next/link'
import { redirect } from 'next/navigation'

import { isAdminSession } from '@/lib/admin-auth'
import { LIFE_PROJECTS } from '@/lib/life/projects'
import { getOwnerSettings } from '@/lib/life/settings'
import { getTasks } from '@/lib/life/tasks'
import { getCurrentLocalDate, localDateTimeToUtc } from '@/lib/life/time'
import type { TaskRecord } from '@/lib/life/types'

const UNASSIGNED = { slug: '__unassigned__', name: 'Unassigned', summary: 'Tasks with no project.' }

function shortDay(localDate: string, timeZone: string) {
  const date = localDateTimeToUtc(localDate, timeZone, 12, 0)
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, day: 'numeric', month: 'short' }).formatToParts(date)
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  return `${lookup.day} ${lookup.month}`
}

export default async function LifeProjectsPage() {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/projects')
  }

  const settings = await getOwnerSettings()
  const today = getCurrentLocalDate(settings.timezone)
  const tasks = (await getTasks({ status: 'all' })).filter((task) => task.status !== 'dismissed')

  const byProject = new Map<string, TaskRecord[]>()
  for (const task of tasks) {
    const key = task.project_slug || UNASSIGNED.slug
    const list = byProject.get(key) || []
    list.push(task)
    byProject.set(key, list)
  }

  // Stable order: defined projects first, then the Unassigned bucket last.
  const columns = [...LIFE_PROJECTS, UNASSIGNED]
    .map((project) => ({ project, tasks: byProject.get(project.slug) || [] }))
    .filter((column) => column.tasks.length > 0)

  const totalOpen = tasks.filter((t) => t.status !== 'done').length

  return (
    <div className="life-projects-shell">
      <div className="life-page-head">
        <div>
          <p className="eyebrow">Projects</p>
          <h1>By project</h1>
        </div>
        <span className="life-week-range">{totalOpen} open</span>
      </div>

      {columns.length === 0 ? (
        <div className="life-empty">No tasks yet. Add one from Today.</div>
      ) : (
        <div className="life-projects-grid">
          {columns.map(({ project, tasks: projectTasks }) => {
            const openTasks = projectTasks.filter((t) => t.status !== 'done')
            const doneCount = projectTasks.length - openTasks.length
            // Open tasks first, most-urgent due dates surfaced by getTasks order.
            const ordered = [...openTasks, ...projectTasks.filter((t) => t.status === 'done')]
            return (
              <div className="life-card life-project-card" key={project.slug}>
                <div className="life-card-head">
                  <h2>{project.name}</h2>
                  <span className="count-pill">{openTasks.length}</span>
                </div>
                <p className="life-project-summary">{project.summary}</p>
                <ul className="life-rows">
                  {ordered.map((task) => {
                    const isDone = task.status === 'done'
                    const dueLabel =
                      task.due_local_date === today
                        ? 'Today'
                        : task.due_local_date
                          ? shortDay(task.due_local_date, settings.timezone)
                          : ''
                    return (
                      <li className="life-row" key={task.id}>
                        <form action={`/api/life/tasks/${task.id}`} method="post">
                          <input type="hidden" name="redirectTo" value="/life/projects" />
                          <input type="hidden" name="status" value={isDone ? 'open' : 'done'} />
                          <button
                            type="submit"
                            className={`life-check${isDone ? ' is-done' : ''}`}
                            aria-label={isDone ? 'Reopen task' : 'Mark task done'}
                          >
                            ✓
                          </button>
                        </form>
                        <div className="life-row-body">
                          <span className={`life-row-title${isDone ? ' is-done' : ''}`}>{task.title}</span>
                          <span className="life-row-meta">
                            <span className={`pri-dot pri-${task.priority}`} />
                            {task.priority}
                          </span>
                        </div>
                        {dueLabel ? <span className="life-row-aside">{dueLabel}</span> : <span />}
                      </li>
                    )
                  })}
                </ul>
                {doneCount > 0 ? (
                  <div className="life-card-foot">
                    <span className="muted-text" style={{ fontSize: 13 }}>
                      {doneCount} done
                    </span>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <Link className="life-btn ghost" href="/life/tasks">
          ← All tasks
        </Link>
      </div>
    </div>
  )
}
