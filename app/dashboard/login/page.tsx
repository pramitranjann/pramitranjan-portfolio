import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { DashboardLoginForm } from '@/components/admin/DashboardLoginForm'
import { isAdminSession } from '@/lib/admin-auth'

export const metadata: Metadata = {
  title: 'Dashboard Login',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default async function DashboardLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const nextPath = params.next?.startsWith('/') ? params.next : '/dashboard'

  if (await isAdminSession()) {
    redirect(nextPath as never)
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: '#0a0a0a' }}>
      <section style={{ width: '100%', maxWidth: '420px', border: '1px solid #1f1f1f', background: '#111111', padding: '28px' }}>
        <p className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120', marginBottom: '16px' }}>
          DASHBOARD_
        </p>
        <h1 className="font-serif" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-serif)', color: '#f5f2ed', marginBottom: '12px' }}>
          If you’re not me, this is just expensive wallpaper.
        </h1>
        <p className="font-mono" style={{ fontSize: 'var(--text-body)', color: '#999999', lineHeight: 1.7, marginBottom: '24px' }}>
          Private entrance for local-first edits to the homepage, About, Work, and photography before committing and pushing them properly.
        </p>
        <DashboardLoginForm nextPath={nextPath} />
      </section>
    </main>
  )
}
