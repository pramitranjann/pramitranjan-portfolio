// components/Nav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
        padding: '24px 40px',
        backgroundColor: 'rgba(13,13,13,0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Link
        href="/"
        className="font-mono"
        style={{ fontSize: '16px', letterSpacing: '0.14em', color: '#FF3120', textDecoration: 'none' }}
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
              className="font-mono transition-colors duration-150"
              style={{
                fontSize: '13px',
                letterSpacing: '0.14em',
                color: active ? '#FF3120' : '#666666',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = '#f5f2ed' }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = '#666666' }}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
