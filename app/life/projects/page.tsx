import { redirect } from 'next/navigation'

import { ProjectsOverview, type ProjectOverviewItem } from '@/components/life/projects/ProjectsOverview'
import { isAdminSession } from '@/lib/admin-auth'
import { listProjects } from '@/lib/life/projects-db'
import { getTasks } from '@/lib/life/tasks'
import { getCurrentLocalDate } from '@/lib/life/time'

export default async function LifeProjectsPage() {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/projects')
  }

  const timezone = 'Asia/Kuala_Lumpur'
  const today = getCurrentLocalDate(timezone)
  const [projects, tasks] = await Promise.all([
    listProjects(),
    getTasks({ status: 'all' }).then((rows) => rows.filter((task) => task.status !== 'dismissed')),
  ])

  const items: ProjectOverviewItem[] = projects.map((project) => {
    const scoped = tasks.filter((task) => task.project_slug === project.slug)
    const open = scoped.filter((task) => task.status !== 'done')
    const done = scoped.filter((task) => task.status === 'done')
    const overdue = open.filter((task) => task.due_local_date != null && task.due_local_date < today)
    const parent = project.parent_slug ? projects.find((candidate) => candidate.slug === project.parent_slug) || null : null
    return {
      slug: project.slug,
      name: project.name,
      summary: project.summary,
      color: project.color,
      parentSlug: project.parent_slug,
      parentName: parent?.name || null,
      status: project.status,
      targetDate: project.target_date,
      open: open.length,
      done: done.length,
      overdue: overdue.length,
      total: scoped.length,
    }
  })

  const parentOptions = projects
    .filter((project) => !project.parent_slug)
    .map((project) => ({ slug: project.slug, name: project.name }))

  return <ProjectsOverview items={items} today={today} parentOptions={parentOptions} />
}
