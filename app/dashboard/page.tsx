import { redirect } from 'next/navigation'
import { DashboardEditor } from '@/components/admin/DashboardEditor'
import { isAdminSession } from '@/lib/admin-auth'
import { getDashboardWriteMode, getDashboardWriteModeLabel, isDashboardSaveEnabled, isLocalDashboardWriteEnabled } from '@/lib/dashboard-storage'
import { getSiteContent } from '@/lib/site-content'

export default async function DashboardPage() {
  if (!(await isAdminSession())) {
    redirect('/dashboard/login')
  }

  const content = await getSiteContent()
  const writeMode = getDashboardWriteMode()
  const saveEnabled = isDashboardSaveEnabled()
  const localWriteEnabled = isLocalDashboardWriteEnabled()

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 24px 64px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gap: '24px' }}>
        <div>
          <p className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120', marginBottom: '12px' }}>
            DASHBOARD_ · {getDashboardWriteModeLabel()}
          </p>
          <h1 className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-serif)', color: '#f5f2ed', lineHeight: 1.05, marginBottom: '12px' }}>
            {writeMode === 'github'
              ? 'Edit on the dashboard, publish to GitHub, and let Vercel deploy it.'
              : writeMode === 'local'
                ? 'Edit the site locally, then push the file changes yourself.'
                : 'Inspect the site content here, then enable publishing before making live edits.'}
          </h1>
          <p className="font-mono" style={{ fontSize: 'var(--text-body)', color: '#999999', lineHeight: 1.8, maxWidth: '720px' }}>
            This dashboard edits the shared JSON content source for the site, including page copy, case studies, card sizing, listening widgets, gallery order, and image placement.
          </p>
          <p className="font-mono" style={{ fontSize: 'var(--text-meta)', color: saveEnabled ? '#666666' : '#FF3120', lineHeight: 1.8, maxWidth: '760px', marginTop: '14px' }}>
            {writeMode === 'github'
              ? 'Publishing here commits the updated JSON into your GitHub repo. Vercel should deploy that commit automatically.'
              : writeMode === 'local'
                ? 'Save here on your machine, review the changes in content/site-content.json, then commit and push them to deploy.'
                : 'This deployment is currently view-only. To publish from the dashboard, configure GitHub publishing env vars or run the site locally.'}
          </p>
        </div>

        <DashboardEditor initialContent={content} saveEnabled={saveEnabled} localWriteEnabled={localWriteEnabled} writeMode={writeMode} />
      </div>
    </main>
  )
}
