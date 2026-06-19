import { redirect } from 'next/navigation'

import { WeekClient, type WeekResponse } from '@/components/life/WeekClient'
import { isAdminSession } from '@/lib/admin-auth'
import { OWNER_ID } from '@/lib/life/constants'
import { getOwnerSettings } from '@/lib/life/settings'
import { getSupabaseAdmin } from '@/lib/life/supabase'
import { getTasks } from '@/lib/life/tasks'
import { getCurrentLocalDate, getWeekStart } from '@/lib/life/time'

export default async function LifeWeekPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/review')
  }

  const params = await searchParams
  const settings = await getOwnerSettings()
  const today = getCurrentLocalDate(settings.timezone)
  const initialStart = params.week || getWeekStart(today)

  const end = (() => {
    const [year, month, day] = initialStart.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    date.setUTCDate(date.getUTCDate() + 6)
    return date.toISOString().slice(0, 10)
  })()

  const supabase = getSupabaseAdmin()
  const [eventsResult, tasks] = await Promise.all([
    supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', OWNER_ID)
      .gte('local_date', initialStart)
      .lte('local_date', end)
      .order('start_time', { ascending: true }),
    getTasks({ status: 'active' }),
  ])

  const initialData: WeekResponse = {
    start: initialStart,
    end,
    timezone: settings.timezone,
    events: eventsResult.data || [],
    tasks,
  }

  return (
    <WeekClient
      initialStart={initialStart}
      today={today}
      timezone={settings.timezone}
      initialData={initialData}
    />
  )

}
