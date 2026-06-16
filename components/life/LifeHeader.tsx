'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

interface NavLeaf {
  href: string
  label: string
  phoneHidden?: boolean
}

// Top-level groups. Each group owns a set of leaf routes; the group tab lights
// up when the current path belongs to it, and the active group's leaves render
// as a secondary sub-tab strip beneath the primary nav.
const LIFE_NAV_GROUPS: Array<{ label: string; leaves: NavLeaf[] }> = [
  {
    label: 'Today',
    leaves: [
      { href: '/life', label: 'Today' },
      { href: '/life/tasks', label: 'Tasks' },
      { href: '/life/projects', label: 'Projects' },
    ],
  },
  {
    label: 'Calendar',
    leaves: [
      { href: '/life/review', label: 'Week' },
      { href: '/life/month', label: 'Month' },
    ],
  },
  {
    label: 'Library',
    leaves: [
      { href: '/life/report', label: 'Reports' },
      { href: '/life/history', label: 'History', phoneHidden: true },
    ],
  },
]

function isLeafActive(href: string, pathname: string) {
  // The index route ('/life') must match exactly — every other Life route also
  // begins with '/life/', so a prefix test would light Today up everywhere.
  return href === '/life'
    ? pathname === '/life'
    : pathname === href || pathname.startsWith(`${href}/`)
}

export function LifeHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = useState('')

  const activeGroup =
    LIFE_NAV_GROUPS.find((group) => group.leaves.some((leaf) => isLeafActive(leaf.href, pathname))) ||
    LIFE_NAV_GROUPS[0]

  function onSearch(event: React.FormEvent) {
    event.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/life/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className="life-header">
      <div className="life-header-top">
        <Link className="brand" href="/life">
          PR / LIFE_
        </Link>
        <nav className="life-nav" aria-label="Life">
          {LIFE_NAV_GROUPS.map((group) => (
            <Link
              key={group.label}
              href={group.leaves[0].href}
              className={`nav-link${group === activeGroup ? ' active' : ''}`}
            >
              {group.label}
            </Link>
          ))}
        </nav>
        <form className="life-search" role="search" onSubmit={onSearch}>
          <span className="life-search-icon" aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            className="life-search-input"
            placeholder="Search…"
            aria-label="Search life"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>
      </div>

      {activeGroup.leaves.length > 1 ? (
        <nav className="life-subnav" aria-label={`${activeGroup.label} views`}>
          {activeGroup.leaves.map((leaf) => (
            <Link
              key={leaf.href}
              href={leaf.href}
              className={`life-subnav-link${isLeafActive(leaf.href, pathname) ? ' active' : ''}${
                leaf.phoneHidden ? ' phone-hidden' : ''
              }`}
            >
              {leaf.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  )
}
