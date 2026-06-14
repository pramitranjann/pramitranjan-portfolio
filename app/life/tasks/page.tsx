import Link from 'next/link'
import { redirect } from 'next/navigation'

import { isAdminSession } from '@/lib/admin-auth'
import { getProjectLabel, LIFE_PROJECTS } from '@/lib/life/projects'
import { getTasks } from '@/lib/life/tasks'
import type { TaskRecord, TaskStatus } from '@/lib/life/types'

function groupTasks(tasks: TaskRecord[]) {
  const groups = new Map<string, TaskRecord[]>()

  for (const task of tasks) {
    const key = task.project_slug || 'unassigned'
    const list = groups.get(key) || []
    list.push(task)
    groups.set(key, list)
  }

  return Array.from(groups.entries()).sort((left, right) => {
    if (left[0] === 'unassigned') return 1
    if (right[0] === 'unassigned') return -1
    return left[0].localeCompare(right[0])
  })
}

export default async function LifeTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; project?: string; error?: string }>
}) {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/tasks')
  }

  const params = await searchParams
  const status = (params.status as TaskStatus | 'active' | 'all' | undefined) || 'active'
  const project = params.project || ''
  const error = params.error || null
  const tasks = await getTasks({ status, projectSlug: project || null })
  const groupedTasks = groupTasks(tasks)

  return (
    <div className="life-planning-grid">
      <section className="hero-card life-planning-hero">
        <div className="life-page-head">
          <p className="eyebrow">Tasks</p>
          <span className="count-pill">{tasks.length}</span>
        </div>

        <form action="/api/life/tasks" className="capture-stack life-task-form" method="post">
          <input name="redirectTo" type="hidden" value="/life/tasks" />
          <label className="field">
            <span>Title</span>
            <input className="text-input" name="title" placeholder="Robin follow-up" required type="text" />
          </label>
          <label className="field">
            <span>Notes</span>
            <textarea className="draft-area" name="details" placeholder="Optional." rows={4} />
          </label>
          <div className="life-entry-controls life-task-inputs">
            <label className="field compact-field">
              <span>Project</span>
              <select className="text-input" defaultValue="" name="projectSlug">
                <option value="">Unassigned</option>
                {LIFE_PROJECTS.map((entry) => (
                  <option key={entry.slug} value={entry.slug}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field compact-field">
              <span>Priority</span>
              <select className="text-input" defaultValue="medium" name="priority">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="field compact-field">
              <span>Due</span>
              <input className="text-input" name="dueLocalDate" type="date" />
            </label>
          </div>
          <button className="primary-button" type="submit">
            Add
          </button>
          {error ? <p className="error-text">{error}</p> : null}
        </form>
      </section>

      <section className="panel-card life-filter-card">
        <div className="toolbar">
          <Link className={`filter-chip ${status === 'active' ? 'is-active' : ''}`} href="/life/tasks?status=active">
            Active
          </Link>
          <Link className={`filter-chip ${status === 'open' ? 'is-active' : ''}`} href="/life/tasks?status=open">
            Open
          </Link>
          <Link className={`filter-chip ${status === 'in_progress' ? 'is-active' : ''}`} href="/life/tasks?status=in_progress">
            Doing
          </Link>
          <Link className={`filter-chip ${status === 'done' ? 'is-active' : ''}`} href="/life/tasks?status=done">
            Done
          </Link>
          <Link className={`filter-chip ${status === 'dismissed' ? 'is-active' : ''}`} href="/life/tasks?status=dismissed">
            Dismissed
          </Link>
          <Link className={`filter-chip ${status === 'all' ? 'is-active' : ''}`} href="/life/tasks?status=all">
            All
          </Link>
        </div>
        <div className="toolbar">
          <Link className={`filter-chip ${project === '' ? 'is-active' : ''}`} href={`/life/tasks?status=${status}`}>
            All projects
          </Link>
          {LIFE_PROJECTS.map((entry) => (
            <Link
              className={`filter-chip ${project === entry.slug ? 'is-active' : ''}`}
              href={`/life/tasks?status=${status}&project=${entry.slug}`}
              key={entry.slug}
            >
              {entry.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="panel-card life-task-board-card">
        <div className="section-head">
          <h2>Board</h2>
        </div>
        {tasks.length === 0 ? <p className="muted-text">No tasks in this slice.</p> : null}
        <div className="task-group-grid">
          {groupedTasks.map(([projectSlug, items]) => (
            <article className="subtle-card task-group-card" key={projectSlug}>
              <div className="section-head">
                <h3>{projectSlug === 'unassigned' ? 'Unassigned' : getProjectLabel(projectSlug) || projectSlug}</h3>
                <span className="badge">{items.length}</span>
              </div>
              <ul className="timeline-list">
                {items.map((task) => (
                  <li className="timeline-item" key={task.id}>
                    <div className="task-row">
                      <div className="task-copy">
                        <strong>{task.title}</strong>
                        <div className="task-meta-row">
                          <span className={`priority-pill priority-${task.priority}`}>{task.priority}</span>
                          <span className="badge secondary">{task.status.replace('_', ' ')}</span>
                          {task.due_local_date ? <span className="badge secondary">Due {task.due_local_date}</span> : null}
                        </div>
                        {task.details ? <p>{task.details}</p> : null}
                      </div>
                      <div className="task-actions">
                        {task.status !== 'done' ? (
                          <form action={`/api/life/tasks/${task.id}`} method="post">
                            <input name="redirectTo" type="hidden" value={`/life/tasks?status=${status}${project ? `&project=${project}` : ''}`} />
                            <input name="status" type="hidden" value="done" />
                            <button className="secondary-button" type="submit">Done</button>
                          </form>
                        ) : null}
                        {task.status !== 'in_progress' && task.status !== 'done' ? (
                          <form action={`/api/life/tasks/${task.id}`} method="post">
                            <input name="redirectTo" type="hidden" value={`/life/tasks?status=${status}${project ? `&project=${project}` : ''}`} />
                            <input name="status" type="hidden" value="in_progress" />
                            <button className="secondary-button" type="submit">Start</button>
                          </form>
                        ) : null}
                        {task.status !== 'dismissed' ? (
                          <form action={`/api/life/tasks/${task.id}`} method="post">
                            <input name="redirectTo" type="hidden" value={`/life/tasks?status=${status}${project ? `&project=${project}` : ''}`} />
                            <input name="status" type="hidden" value="dismissed" />
                            <button className="secondary-button" type="submit">Dismiss</button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
