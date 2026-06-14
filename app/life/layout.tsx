import type { Metadata } from 'next'

import { LifeHeader } from '@/components/life/LifeHeader'

export const metadata: Metadata = {
  title: 'Life',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function LifeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="life-shell">
      <div className="life-app-shell">
        <LifeHeader />
        <main className="content-shell">{children}</main>
      </div>
    </div>
  )
}
