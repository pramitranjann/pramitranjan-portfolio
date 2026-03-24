import { redirect } from 'next/navigation'
import { DashboardEditor } from '@/components/admin/DashboardEditor'
import { isAdminSession } from '@/lib/admin-auth'
import { getSiteContent } from '@/lib/site-content'

export default async function DashboardPage() {
  if (!(await isAdminSession())) {
    redirect('/dashboard/login')
  }

  const content = await getSiteContent()

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 24px 64px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gap: '24px' }}>
        <div>
          <p className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120', marginBottom: '12px' }}>
            DASHBOARD_
          </p>
          <h1 className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '12px' }}>
            Edit the site without touching the code.
          </h1>
          <p className="font-mono" style={{ fontSize: 'var(--text-body)', color: '#999999', lineHeight: 1.8, maxWidth: '720px' }}>
            This admin panel edits the shared content source for the site, including page copy, case studies, card sizing, listening widgets, gallery order, and image placement.
          </p>
        </div>

        <DashboardEditor initialContent={content} />
      </div>
    </main>
  )
}
