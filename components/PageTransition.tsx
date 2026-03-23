// components/PageTransition.tsx
'use client'
import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)
CustomEase.create('wipeIn',  '0.55, 0, 1, 1')
CustomEase.create('wipeOut', '0, 0, 0.2, 1')

function getLabel(path: string): string {
  if (path.startsWith('/work')) return 'WORK_'
  if (path.startsWith('/creative')) return 'CREATIVE_'
  if (path.startsWith('/about')) return 'ABOUT_'
  return ''
}

function findHref(target: EventTarget | null): string | null {
  let el = target as HTMLElement | null
  while (el) {
    if (el.tagName === 'A') return (el as HTMLAnchorElement).getAttribute('href')
    el = el.parentElement
  }
  return null
}

export function PageTransition() {
  const pathname = usePathname()
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const isAnimating = useRef(false)

  // Phase 2: pathname has changed — reveal the new page
  useEffect(() => {
    const panel = panelRef.current
    // Only run reveal if we triggered a transition via click interception
    if (!panel || !isAnimating.current) return

    gsap.timeline({ onComplete: () => { isAnimating.current = false } })
      .to(panel, { xPercent: 100, duration: 0.9, ease: 'wipeOut', delay: 0.5 })
      .set(panel, { autoAlpha: 0 })
  }, [pathname])

  // Phase 1: intercept link clicks in capture phase — before Next.js Link fires
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const href = findHref(e.target)
      // Only internal paths, not external or protocol-relative
      if (!href || !href.startsWith('/') || href.startsWith('//')) return

      const current = window.location.pathname
      // Skip homepage in either direction
      if (current === '/' || href === '/') return
      // Skip same-page clicks
      if (href.split('?')[0].split('#')[0] === current) return
      // Skip if already mid-transition
      if (isAnimating.current) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const panel = panelRef.current
      const label = labelRef.current
      if (!panel || !label) return

      // Intercept — we handle the navigation ourselves
      e.preventDefault()
      e.stopPropagation()

      label.textContent = getLabel(href)
      isAnimating.current = true

      // Cover fully, then navigate — no flash of destination page
      gsap.timeline()
        .set(panel, { xPercent: -100, autoAlpha: 1 })
        .to(panel, { xPercent: 0, duration: 0.35, ease: 'wipeIn',
          onComplete: () => { router.push(href) }
        })
    }

    // Capture phase fires before any element's onClick, including Next.js Link
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [router])

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#080808',
        zIndex: 100,
        visibility: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '24px 32px',
        pointerEvents: 'none',
      }}
    >
      {/* Red trailing edge */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '3px',
        background: '#FF3120',
      }} />
      <span
        ref={labelRef}
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '11px',
          letterSpacing: '0.18em',
          color: '#FF3120',
        }}
      />
    </div>
  )
}
