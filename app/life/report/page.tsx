import { redirect } from 'next/navigation'

import { ReportClient } from '@/components/life/ReportClient'
import { isAdminSession } from '@/lib/admin-auth'

export default async function LifeReportPage() {
  if (!(await isAdminSession())) {
    redirect('/dashboard/login?next=/life/report')
  }

  return <ReportClient />
}
