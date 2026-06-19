import Link from 'next/link'
import { redirect } from 'next/navigation'

import { isAdminSession } from '@/lib/admin-auth'
import { LIFE_PROJECTS, type LifeProject } from '@/lib/life/projects'
import { getTasks } from '@/lib/life/tasks'
import { getCurrentLocalDate, localDateTimeToUtc } from '@/lib/life/time'

const UNASSIGNED: LifeProject = {
  slug: '__unassigned__',
  name: 'Unassigned',
  summary: 'Tasks with no project.',
  aliases: [],
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

export default async function LifeProjectsPage() {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/projects')
  }

  const timezone = 'Asia/Kuala_Lumpur'
  const today = getCurrentLocalDate(timezone)
  const tasks = (await getTasks({ status: 'all' })).filter((task) => task.status !== 'dismissed')
  const projectRows = [...LIFE_PROJECTS, UNASSIGNED]
    .map((project) => {
      const scoped = tasks.filter((task) => (task.project_slug || UNASSIGNED.slug) === project.slug)
      const openItems = scoped.filter((task) => task.status !== 'done')
      const doneItems = scoped.filter((task) => task.status === 'done')
      return {
        slug: project.slug,
        name: project.name,
        summary: project.summary,
        open: openItems.length,
        done: doneItems.length,
        openItems,
        doneItems,
      }
    })
    .filter((project) => project.open > 0 || project.done > 0)

  const totalOpen = projectRows.reduce((sum, project) => sum + project.open, 0)

  return (
    <div className="life-projects-shell">
      <div className="life-page-head">
        <div>
          <p className="eyebrow">Projects</p>
          <h1>By project</h1>
        </div>
        <div className="life-week-range">{totalOpen} open</div>
      </div>

      <div className="life-projects-grid">
        {projectRows.map((project) => (
          <div key={project.slug} className="life-card life-project-card">
            <div className="life-card-head">
              <h2>{project.name}</h2>
              <span className="count-pill">{project.open}</span>
            </div>
            <p className="life-project-summary">{project.summary}</p>
            <div className="life-rows">
              {project.openItems.slice(0, 4).map((task) => (
                <Link
                  key={task.id}
                  href={`/life/tasks?project=${encodeURIComponent(project.slug)}`}
                  className="life-row"
                >
                  <span className="life-check" aria-hidden="true" />
                  <div className="life-row-body">
                    <span className="life-row-title">{task.title}</span>
                    <span className="life-row-meta">
                      <span className={`pri-dot pri-${task.priority}`} />
                      {task.priority}
                    </span>
                  </div>
                  <span className="life-row-aside">
                    {task.due_local_date === today
                      ? 'Today'
                      : task.due_local_date
                        ? shortDay(task.due_local_date, timezone)
                        : ''}
                  </span>
                </Link>
              ))}
            </div>
            {project.done > 0 ? <div className="life-card-foot">{project.done} done</div> : null}
          </div>
        ))}
      </div>
    </div>
  )
}
