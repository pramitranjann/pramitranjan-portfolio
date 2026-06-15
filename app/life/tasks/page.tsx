import { redirect } from 'next/navigation'

import { TasksClient } from '@/components/life/tasks/TasksClient'
import { isAdminSession } from '@/lib/admin-auth'
import { getOwnerSettings } from '@/lib/life/settings'
import { getTasks } from '@/lib/life/tasks'
import { getCurrentLocalDate } from '@/lib/life/time'

export default async function LifeTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/tasks')
  }

  const params = await searchParams
  const error = params.error || null
  const settings = await getOwnerSettings()
  const today = getCurrentLocalDate(settings.timezone)
  const tasks = (await getTasks({ status: 'all' })).filter((task) => task.status !== 'dismissed')

  return <TasksClient tasks={tasks} today={today} error={error} />
}
