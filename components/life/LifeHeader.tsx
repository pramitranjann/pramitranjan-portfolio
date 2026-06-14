'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LIFE_NAV_ITEMS = [
  { href: '/life', label: 'Today' },
  { href: '/life/tasks', label: 'Tasks' },
  { href: '/life/report', label: 'Report' },
  { href: '/life/review', label: 'Weekly' },
  { href: '/life/history', label: 'History' },
]

export function LifeHeader() {
  const pathname = usePathname()

  return (
    <header className="life-header">
      <Link className="brand" href="/life">
        PR/LIFE
      </Link>
      <nav className="life-nav" aria-label="Life">
        {LIFE_NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link font-mono${active ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
