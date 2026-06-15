import { redirect } from 'next/navigation'

import { WeekClient } from '@/components/life/WeekClient'
import { isAdminSession } from '@/lib/admin-auth'
import { getOwnerSettings } from '@/lib/life/settings'
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

  return <WeekClient initialStart={initialStart} today={today} timezone={settings.timezone} />

}
