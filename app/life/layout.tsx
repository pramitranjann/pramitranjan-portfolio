import type { Metadata, Viewport } from 'next'

import { LifeHeader } from '@/components/life/LifeHeader'
import { LifeProjectsProvider } from '@/components/life/LifeProjectsProvider'
import { listProjectsClient } from '@/lib/life/projects-db'
import type { LifeProjectClient } from '@/lib/life/types'

export const metadata: Metadata = {
  title: 'Life',
  // Makes the home-screen bookmark launch as a standalone app (no Safari
  // chrome, no URL bar). The status bar is rendered translucent over the dark
  // app background so the top inset feels like part of the UI.
  manifest: '/life-manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Life',
    statusBarStyle: 'black-translucent',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  // viewport-fit=cover lets the app paint under the iPhone notch / home
  // indicator; the life-app-shell already pads with safe-area-inset-bottom.
  viewportFit: 'cover',
  // Stop pinch-zoom from breaking the app-like feel.
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function LifeLayout({ children }: { children: React.ReactNode }) {
  // Loaded once and shared with every client component via context so project
  // pickers/labels reflect the live DB list (falls back to the seed list).
  let projects: LifeProjectClient[] = []
  try {
    projects = await listProjectsClient()
  } catch (error) {
    console.error('Failed to load projects for layout context', error)
  }

  return (
    <div className="life-shell">
      <LifeProjectsProvider projects={projects}>
        <div className="life-app-shell">
          <LifeHeader />
          <main className="content-shell">{children}</main>
        </div>
      </LifeProjectsProvider>
    </div>
  )
}
