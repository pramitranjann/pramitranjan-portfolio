import { redirect } from 'next/navigation'

import { TasksClient } from '@/components/life/tasks/TasksClient'
import { isAdminSession } from '@/lib/admin-auth'
import { getTasks } from '@/lib/life/tasks'
import type { TaskStatus } from '@/lib/life/types'

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

  return (
    <div className="life-tasks-page">
      <div className="life-page-head">
        <p className="eyebrow">Tasks</p>
        <span className="count-pill">{tasks.length}</span>
      </div>
      <TasksClient tasks={tasks} status={status} project={project} error={error} />
    </div>
  )
}
