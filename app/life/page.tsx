import { redirect } from 'next/navigation'

import { TodayClient } from '@/components/life/TodayClient'
import { isAdminSession } from '@/lib/admin-auth'

export default async function LifeTodayPage() {
  if (!(await isAdminSession())) {
    redirect('/dashboard/login?next=/life')
  }

  return <TodayClient />
}
