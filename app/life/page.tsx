import { redirect } from 'next/navigation'

import { TodayClient } from '@/components/life/TodayClient'
import { isAdminSession } from '@/lib/admin-auth'

export default async function LifeTodayPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life')
  }

  const params = await searchParams
  const error = params.error === 'content' ? 'Content is required.' : params.error || null

  return <TodayClient initialError={error} />
}
