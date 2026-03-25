import { redirect } from 'next/navigation'
import { DashboardEditor } from '@/components/admin/DashboardEditor'
import { isAdminSession } from '@/lib/admin-auth'
import { getDashboardWriteModeLabel, isLocalDashboardWriteEnabled } from '@/lib/dashboard-storage'
import { getSiteContent } from '@/lib/site-content'

export default async function DashboardPage() {
  if (!(await isAdminSession())) {
    redirect('/dashboard/login')
  }

  const content = await getSiteContent()
  const localWriteEnabled = isLocalDashboardWriteEnabled()

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 24px 64px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gap: '24px' }}>
        <div>
          <p className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120', marginBottom: '12px' }}>
            DASHBOARD_ · {getDashboardWriteModeLabel()}
          </p>
          <h1 className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '12px' }}>
            Edit the site locally, then push the file changes yourself.
          </h1>
          <p className="font-mono" style={{ fontSize: 'var(--text-body)', color: '#999999', lineHeight: 1.8, maxWidth: '720px' }}>
            This dashboard edits the shared JSON content source for the site, including page copy, case studies, card sizing, listening widgets, gallery order, and image placement.
          </p>
          <p className="font-mono" style={{ fontSize: 'var(--text-meta)', color: localWriteEnabled ? '#666666' : '#FF3120', lineHeight: 1.8, maxWidth: '760px', marginTop: '14px' }}>
            {localWriteEnabled
              ? 'Save here on your machine, review the changes in content/site-content.json, then commit and push them to deploy.'
              : 'This Vercel deployment is view-only. To make persistent content edits, run the site locally, save there, then commit and push the updated JSON file.'}
          </p>
        </div>

        <DashboardEditor initialContent={content} localWriteEnabled={localWriteEnabled} />
      </div>
    </main>
  )
}
