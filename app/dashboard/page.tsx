import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { DashboardEditor } from '@/components/admin/DashboardEditor'
import { isAdminSession } from '@/lib/admin-auth'
import { getDashboardWriteMode, getDashboardWriteModeLabel, isDashboardSaveEnabled, isLocalDashboardWriteEnabled } from '@/lib/dashboard-storage'
import { getSiteContent } from '@/lib/site-content'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default async function DashboardPage() {
  if (!(await isAdminSession())) {
    redirect('/dashboard/login')
  }

  const content = await getSiteContent()
  const writeMode = getDashboardWriteMode()
  const saveEnabled = isDashboardSaveEnabled()
  const localWriteEnabled = isLocalDashboardWriteEnabled()

  return (
    <main className="dashboard-shell" style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 24px 64px' }}>
      <div className="dashboard-stack" style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gap: '24px' }}>
        <div>
          <p className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120', marginBottom: '12px' }}>
            DASHBOARD_ · {getDashboardWriteModeLabel()}
          </p>
          <h1 className="font-serif dashboard-page-title" style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-serif)', color: '#f5f2ed', lineHeight: 1.05, marginBottom: 0 }}>
            Dashboard
          </h1>
        </div>

        <DashboardEditor initialContent={content} saveEnabled={saveEnabled} localWriteEnabled={localWriteEnabled} writeMode={writeMode} />
      </div>
    </main>
  )
}
