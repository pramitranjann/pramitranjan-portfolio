'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LIFE_NAV_ITEMS: Array<{ href: string; label: string; phoneHidden?: boolean }> = [
  { href: '/life', label: 'Today' },
  { href: '/life/tasks', label: 'Tasks' },
  { href: '/life/review', label: 'Week' },
  { href: '/life/report', label: 'Reports' },
  { href: '/life/history', label: 'History', phoneHidden: true },
]

export function LifeHeader() {
  const pathname = usePathname()

  return (
    <header className="life-header">
      <Link className="brand" href="/life">
        PR / LIFE_
      </Link>
      <nav className="life-nav" aria-label="Life">
        {LIFE_NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link${active ? ' active' : ''}${item.phoneHidden ? ' phone-hidden' : ''}`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
