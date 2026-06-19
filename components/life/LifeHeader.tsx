'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface NavLeaf {
  href: string
  label: string
}

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
      { href: '/life/history', label: 'Entries' },
    ],
  },
]

const LIFE_DESKTOP_NAV = LIFE_NAV_GROUPS.flatMap((group) => group.leaves)

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
  const [mobileOpenGroup, setMobileOpenGroup] = useState<string | null>(null)

  const activeGroup =
    LIFE_NAV_GROUPS.find((group) => group.leaves.some((leaf) => isLeafActive(leaf.href, pathname))) ||
    LIFE_NAV_GROUPS[0]

  useEffect(() => {
    setMobileOpenGroup(null)
  }, [pathname])

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
          LIFE_
        </Link>
        <nav className="life-nav life-desktop-nav" aria-label="Life">
          {LIFE_DESKTOP_NAV.map((leaf) => (
            <Link
              key={leaf.href}
              href={leaf.href}
              className={`nav-link${isLeafActive(leaf.href, pathname) ? ' active' : ''}`}
            >
              {leaf.label}
            </Link>
          ))}
        </nav>
        <button
          className="life-add-btn life-header-phone-search"
          type="button"
          aria-label="Search life"
          onClick={() => router.push('/life/search')}
        >
          ⌕
        </button>
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
        {mobileOpenGroup === activeGroup.label && activeGroup.leaves.length > 1 ? (
          <nav className="life-bottom-subnav" aria-label={`${activeGroup.label} views`}>
            {activeGroup.leaves.map((leaf) => (
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
    </header>
  )
}
