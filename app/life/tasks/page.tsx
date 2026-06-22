import { redirect } from 'next/navigation'

import { TasksClient } from '@/components/life/tasks/TasksClient'
import { isAdminSession } from '@/lib/admin-auth'
import { getCalendarEventsByIds } from '@/lib/life/calendar'
import { getOwnerSettings } from '@/lib/life/settings'
import { getTasks } from '@/lib/life/tasks'
import { getCurrentLocalDate } from '@/lib/life/time'
import type { TaskLinkedEvent } from '@/lib/life/types'

export default async function LifeTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; project?: string }>
}) {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/tasks')
  }

  const params = await searchParams
  const error = params.error || null
  const initialProjectSlug = params.project || null
  const settings = await getOwnerSettings()
  const today = getCurrentLocalDate(settings.timezone)
  const tasks = (await getTasks({ status: 'all' })).filter((task) => task.status !== 'dismissed')

  // Denormalise any linked calendar events so cards can show their time/title.
  const linkedEvents: Record<string, TaskLinkedEvent> = {}
  const linkedIds = tasks.map((task) => task.calendar_event_id).filter((id): id is string => Boolean(id))
  if (linkedIds.length > 0) {
    try {
      const events = await getCalendarEventsByIds(linkedIds)
      for (const event of events) {
        linkedEvents[event.id] = {
          id: event.id,
          title: event.title || 'Event',
          startTime: event.start_time,
          allDay: event.all_day,
          htmlLink: event.html_link,
        }
      }
    } catch (eventError) {
      console.error('Failed to load linked calendar events', eventError)
    }
  }

  return (
    <TasksClient
      tasks={tasks}
      today={today}
      timezone={settings.timezone}
      error={error}
      initialProjectSlug={initialProjectSlug}
      linkedEvents={linkedEvents}
    />
  )
}
