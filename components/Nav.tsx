// components/Nav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { playNav } from '@/lib/sounds'

const links = [
  { href: '/work',     label: 'WORK' },
  { href: '/creative', label: 'CREATIVE' },
  { href: '/about',    label: 'ABOUT' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav
      className="site-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-divider"
      style={{
        padding: 'var(--layout-nav-padding-y) var(--layout-page-gutter)',
        backgroundColor: 'var(--nav-background)',
        backdropFilter: 'blur(8px)',
        borderColor: 'var(--nav-border-color)',
      }}
    >
      <Link
        href="/"
        className="font-mono"
        style={{ fontSize: 'var(--nav-logo-size)', letterSpacing: '0.14em', color: 'var(--nav-logo-color)', textDecoration: 'none' }}
        onPointerDown={playNav}
      >
        PR
      </Link>
      <div className="flex gap-6">
        {links.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`nav-link font-mono${active ? ' active' : ''}`}
              style={{ fontSize: 'var(--nav-link-size)', letterSpacing: '0.14em', textDecoration: 'none' }}
              onPointerDown={playNav}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
