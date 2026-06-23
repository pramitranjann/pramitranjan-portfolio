import { notFound, redirect } from 'next/navigation'

import { ProjectWorkspace } from '@/components/life/projects/ProjectWorkspace'
import { isAdminSession } from '@/lib/admin-auth'
import { getCalendarEventsByIds } from '@/lib/life/calendar'
import { listMilestones } from '@/lib/life/milestones'
import { getProjectEvents } from '@/lib/life/project-events'
import { listRefs } from '@/lib/life/project-refs'
import { getProjectBySlugDb } from '@/lib/life/projects-db'
import { getOwnerSettings } from '@/lib/life/settings'
import { getTasks } from '@/lib/life/tasks'
import { getCurrentLocalDate } from '@/lib/life/time'
import type { TaskLinkedEvent } from '@/lib/life/types'

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/projects')
  }

  const { slug } = await params
  const project = await getProjectBySlugDb(slug)
  if (!project) {
    notFound()
  }

  const settings = await getOwnerSettings()
  const today = getCurrentLocalDate(settings.timezone)

  const [tasks, milestones, refs] = await Promise.all([
    getTasks({ status: 'all', projectSlug: slug }).then((rows) => rows.filter((task) => task.status !== 'dismissed')),
    listMilestones(slug),
    listRefs(slug),
  ])

  // Events tied to this project = explicitly mapped events + events linked from
  // the project's own tasks.
  const taskEventIds = tasks.map((task) => task.calendar_event_id).filter((id): id is string => Boolean(id))
  const events = await getProjectEvents(slug, taskEventIds).catch(() => [])

  // Denormalise linked events so task cards can render their time/title.
  const linkedEvents: Record<string, TaskLinkedEvent> = {}
  if (taskEventIds.length > 0) {
    try {
      const linked = await getCalendarEventsByIds(taskEventIds)
      for (const event of linked) {
        linkedEvents[event.id] = {
          id: event.id,
          title: event.title || 'Event',
          startTime: event.start_time,
          allDay: event.all_day,
          htmlLink: event.html_link,
        }
      }
    } catch (error) {
      console.error('Failed to load linked events for project', error)
    }
  }

  return (
    <ProjectWorkspace
      project={project}
      tasks={tasks}
      milestones={milestones}
      refs={refs}
      events={events}
      linkedEvents={linkedEvents}
      today={today}
      timezone={settings.timezone}
    />
  )
}
