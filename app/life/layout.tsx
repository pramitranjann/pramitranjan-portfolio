import type { Metadata } from 'next'
import Link from 'next/link'

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
        <header className="topbar">
          <Link className="brand" href="/life">
            Chief of Staff
          </Link>
          <nav className="nav-links">
            <Link href="/life">Today</Link>
            <Link href="/life/tasks">Tasks</Link>
            <Link href="/life/report">Report</Link>
            <Link href="/life/review">Weekly</Link>
            <Link href="/life/history">History</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
        </header>
        <main className="content-shell">{children}</main>
      </div>
    </div>
  )
}
