'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { LifeInlineSearch } from '@/components/life/LifeInlineSearch'

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
      { href: '/life/studio', label: 'Studio' },
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

function isLeafActive(href: string, pathname: string) {
  return href === '/life'
    ? pathname === '/life'
    : pathname === href || pathname.startsWith(`${href}/`)
}

export function LifeHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpenGroup, setMobileOpenGroup] = useState<string | null>(null)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  const activeGroup =
    LIFE_NAV_GROUPS.find((group) => group.leaves.some((leaf) => isLeafActive(leaf.href, pathname))) ||
    LIFE_NAV_GROUPS[0]

  useEffect(() => {
    setMobileOpenGroup(null)
    setMobileSearchOpen(false)
    setOpenMenu(null)
  }, [pathname])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    function onDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [])

  function onMobileGroupPress(label: string, href: string) {
    setMobileSearchOpen(false)
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

        <nav
          ref={navRef}
          className="life-nav-bar life-desktop-nav"
          aria-label="Life"
        >
          {LIFE_NAV_GROUPS.map((group) => {
            const isGroupActive = group.leaves.some((leaf) => isLeafActive(leaf.href, pathname))
            const isOpen = openMenu === group.label
            return (
              <div key={group.label} className="life-nav-bar-item">
                <button
                  type="button"
                  className={[
                    'life-nav-bar-trigger',
                    isOpen ? 'open' : '',
                    isGroupActive ? 'group-active' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setOpenMenu(isOpen ? null : group.label)}
                  onMouseEnter={() => { if (openMenu) setOpenMenu(group.label) }}
                >
                  {group.label}
                </button>
                {isOpen && (
                  <div className="life-nav-bar-menu">
                    {group.leaves.map((leaf) => (
                      <Link
                        key={leaf.href}
                        href={leaf.href}
                        className={`life-nav-bar-link${isLeafActive(leaf.href, pathname) ? ' active' : ''}`}
                      >
                        {leaf.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <LifeInlineSearch
          isOpen={mobileSearchOpen}
          onOpen={() => {
            setMobileOpenGroup(null)
            setMobileSearchOpen(true)
          }}
          onClose={() => setMobileSearchOpen(false)}
        />
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
