'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

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
    label: 'Workspace',
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
      { href: '/life/history', label: 'Entries', phoneHidden: true },
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
  const [mobileOpenGroup, setMobileOpenGroup] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const activeGroup =
    LIFE_NAV_GROUPS.find((group) => group.leaves.some((leaf) => isLeafActive(leaf.href, pathname))) ||
    LIFE_NAV_GROUPS[0]
  const activeGroupVisibleLeaves = activeGroup.leaves.filter((leaf) => !leaf.phoneHidden)

  useEffect(() => {
    setMobileOpenGroup(null)
  }, [pathname])

  function onSearch(event: React.FormEvent) {
    event.preventDefault()
    const q = query.trim()
    if (!q) {
      searchInputRef.current?.focus()
      return
    }
    router.push(`/life/search?q=${encodeURIComponent(q)}`)
  }

  function onMobileGroupPress(label: string, href: string) {
    if (label === activeGroup.label) {
      setMobileOpenGroup((current) => (current === label ? null : label))
      return
    }
    router.push(href)
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
      </div>

      <nav className="life-bottom-nav" aria-label="Life mobile">
        <div className="life-bottom-nav-groups">
          {LIFE_NAV_GROUPS.map((group) => (
            <button
              key={group.label}
              type="button"
              className={`life-bottom-nav-link${group === activeGroup ? ' active' : ''}`}
              aria-expanded={group.label === activeGroup.label && mobileOpenGroup === group.label}
              onClick={() => onMobileGroupPress(group.label, group.leaves[0].href)}
            >
              {group.label}
            </button>
          ))}
        </div>
        {mobileOpenGroup === activeGroup.label && activeGroupVisibleLeaves.length > 1 ? (
          <nav className="life-bottom-subnav" aria-label={`${activeGroup.label} views`}>
            {activeGroupVisibleLeaves.map((leaf) => (
              <Link
                key={leaf.href}
                href={leaf.href}
                className={`life-bottom-subnav-link${isLeafActive(leaf.href, pathname) ? ' active' : ''}`}
              >
                {leaf.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </nav>

      {/* Secondary row: the active group's view sub-tabs (e.g. Week / Month)
          sit on the left, with search pushed to the right end of the same line. */}
      <div className="life-header-sub">
        <div className="life-header-section">
          <span className="life-section-label">{activeGroup.label}</span>
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
          ) : (
            <span />
          )}
        </div>
        <form className="life-search" role="search" onSubmit={onSearch}>
          <button type="submit" className="life-search-button" aria-label="Search life">
            ⌕
          </button>
          <input
            ref={searchInputRef}
            type="search"
            className="life-search-input"
            placeholder="Search"
            aria-label="Search life"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>
      </div>
    </header>
  )
}
