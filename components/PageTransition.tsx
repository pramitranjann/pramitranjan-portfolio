// components/PageTransition.tsx
'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)
// Matches the spec's cubic-bezier(0.77, 0, 0.175, 1) — the same curve used in the intro animation
// Fast-in curve for cover, slow-out for reveal
CustomEase.create('wipeIn',  '0.55, 0, 1, 1')
CustomEase.create('wipeOut', '0, 0, 0.2, 1')

function getLabel(path: string): string {
  if (path.startsWith('/work')) return 'WORK_'
  if (path.startsWith('/creative')) return 'CREATIVE_'
  if (path.startsWith('/about')) return 'ABOUT_'
  return ''
}

export function PageTransition() {
  const pathname = usePathname()
  const prevPathname = useRef<string>(pathname)
  const panelRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const isAnimating = useRef(false)

  useEffect(() => {
    const prev = prevPathname.current
    // Update unconditionally before all guards — keeps prevPathname coherent even for skipped transitions.
    prevPathname.current = pathname

    // Skip: same page, or homepage involved in either direction, or already animating
    if (prev === pathname) return
    if (prev === '/' || pathname === '/') return
    // Intentional: if already animating, drop the new transition rather than queue it.
    // prevPathname has already advanced, so the component stays coherent after this animation completes.
    if (isAnimating.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const panel = panelRef.current
    const label = labelRef.current
    if (!panel || !label) return

    label.textContent = getLabel(pathname)
    isAnimating.current = true

    gsap.timeline({ onComplete: () => { isAnimating.current = false } })
      .set(panel, { xPercent: -100, autoAlpha: 1 })
      .to(panel, { xPercent: 0, duration: 0.35, ease: 'wipeIn' })   // cover
      .to(panel, { xPercent: 100, duration: 0.9, ease: 'wipeOut', delay: 0.5 })  // hold + slow reveal
      .set(panel, { autoAlpha: 0 })

    return () => {
      if (panelRef.current) gsap.killTweensOf(panelRef.current)
      isAnimating.current = false
    }
  }, [pathname])

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
