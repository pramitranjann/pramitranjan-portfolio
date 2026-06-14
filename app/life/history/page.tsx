import { redirect } from 'next/navigation'

import { HistoryClient } from '@/components/life/HistoryClient'
import { isAdminSession } from '@/lib/admin-auth'

export default async function LifeHistoryPage() {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/history')
  }

  return <HistoryClient />
}
