import { redirect } from 'next/navigation'

import { MonthClient } from '@/components/life/MonthClient'
import { isAdminSession } from '@/lib/admin-auth'
import { getOwnerSettings } from '@/lib/life/settings'
import { getCurrentLocalDate } from '@/lib/life/time'

export default async function LifeMonthPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/month')
  }

  const params = await searchParams
  const settings = await getOwnerSettings()
  const today = getCurrentLocalDate(settings.timezone)
  // `month` is the first-of-month anchor (YYYY-MM-01); default to today's month.
  const initialMonth = params.month || `${today.slice(0, 7)}-01`

  return <MonthClient initialMonth={initialMonth} today={today} timezone={settings.timezone} />
}
