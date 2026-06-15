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
          // The Today tab lives at the index route ('/life'). Because every other
          // Life route ALSO begins with '/life/', a `startsWith('/life/')` test
          // marks Today active on every page — which is why Today + the current
          // tab both showed the red underline. The index route must match exactly;
          // only sub-routes use the prefix test (so e.g. '/life/tasks/123' still
          // lights up Tasks).
          const active =
            item.href === '/life'
              ? pathname === '/life'
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

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
