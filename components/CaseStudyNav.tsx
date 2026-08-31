'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type Section = { id: string; label: string }

export function updateCaseStudyNavProgress(
  nav: HTMLElement | null,
  targets: HTMLElement[],
  currentScroll: number,
  anchors: number[],
): string | null {
  if (!nav || targets.length < 2 || anchors.length !== targets.length) return null

  const buttons = Array.from(nav.querySelectorAll<HTMLElement>('[data-nav-id]'))
  if (buttons.length !== targets.length) return null

  const centres = buttons.map((button) => button.offsetTop + button.offsetHeight / 2)
  let position = centres[0]

  if (currentScroll >= anchors[anchors.length - 1]) {
    position = centres[centres.length - 1]
  } else if (currentScroll > anchors[0]) {
    const segment = anchors.findIndex((anchor, index) => index > 0 && currentScroll < anchor)
    const upperIndex = segment === -1 ? anchors.length - 1 : segment
    const lowerIndex = upperIndex - 1
    const span = Math.max(1, anchors[upperIndex] - anchors[lowerIndex])
    const progress = Math.min(1, Math.max(0, (currentScroll - anchors[lowerIndex]) / span))
    position = centres[lowerIndex] + (centres[upperIndex] - centres[lowerIndex]) * progress
  }

  nav.style.setProperty('--case-study-nav-progress-y', `${position}px`)
  nav.dataset.progressReady = 'true'

  const closestIndex = centres.reduce((closest, centre, index) => (
    Math.abs(centre - position) < Math.abs(centres[closest] - position) ? index : closest
  ), 0)
  return targets[closestIndex]?.id ?? null
}

export function CaseStudyNav({ backHref = '/work', backLabel = 'WORK' }: { backHref?: string; backLabel?: string }) {
  // Derived from the DOM, not hardcoded: EditorialCaseStudy emits a different
  // set per case study (Redesign / Live / Solution), so a fixed list rendered a
  // dead button on every page that wasn't Franklin's.
  const [sections, setSections] = useState<Section[]>([])
  const [activeId, setActiveId] = useState('')
  const [visible, setVisible] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const found = Array.from(
      document.querySelectorAll<HTMLElement>('main.editorial-page section[id][data-section]'),
    )
      .filter((el) => el.id !== 'overview')
      .map((el) => ({ id: el.id, label: el.dataset.section ?? el.id }))

    setSections(found)
    setActiveId(found[0]?.id ?? '')
  }, [])

  useEffect(() => {
    if (!sections.length) return

    const targets = sections
      .map(({ id }) => document.getElementById(id))
      .filter((target): target is HTMLElement => target !== null)

    if (!targets.length) return

    let frame = 0
    const update = () => {
      frame = 0
      const heroCopy = document.querySelector('.editorial-hero-copy')
      const activationLine = window.innerWidth <= 768 ? 65 : 220
      const revealThreshold = window.innerWidth <= 768 ? 12 : 72
      const thresholdActive = targets.reduce<HTMLElement>((current, target) => (
        target.getBoundingClientRect().top <= activationLine ? target : current
      ), targets[0])

      setVisible((heroCopy?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY) <= revealThreshold)
      const progressActiveId = updateCaseStudyNavProgress(
        navRef.current,
        targets,
        window.scrollY,
        targets.map((target) => window.scrollY + target.getBoundingClientRect().top - activationLine),
      )
      setActiveId(progressActiveId ?? thresholdActive.id)
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [sections])

  useEffect(() => {
    if (!activeId || !navRef.current) return
    const activeBtn = navRef.current.querySelector<HTMLElement>(`[data-nav-id="${activeId}"]`)
    activeBtn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeId])

  if (sections.length < 2) return null

  return (
    <nav
      ref={navRef}
      className="case-study-section-nav editorial-case-study-nav"
      aria-label="Case study sections"
      data-visible={visible || undefined}
    >
      <span className="editorial-case-study-nav-progress" aria-hidden="true" />
      <span className="font-mono editorial-case-study-nav-title">CONTENTS</span>
      {sections.map((section, index) => {
        const isActive = activeId === section.id

        return (
          <button
            key={section.id}
            type="button"
            data-nav-id={section.id}
            className="font-mono case-study-section-nav-button editorial-case-study-nav-button"
            aria-current={isActive ? 'location' : undefined}
            data-active={isActive || undefined}
            onClick={() => {
              const target = document.getElementById(section.id)
              if (!target) return

              const offset = window.innerWidth <= 768 ? 65 : 150
              window.scrollTo({
                top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset),
                behavior: 'smooth',
              })
            }}
          >
            {section.label}
            {isActive ? <span className="editorial-case-study-nav-indicator" aria-hidden="true" /> : null}
          </button>
        )
      })}
      {/* Last: the hero's back link has scrolled away by the time this appears.
          Reuses the button classes so it sits in the same visual language. */}
      <Link
        href={backHref}
        data-last
        className="font-mono case-study-section-nav-button editorial-case-study-nav-button editorial-case-study-nav-back"
      >
        <span className="arrow-nudge-back">←</span> {backLabel}
      </Link>
    </nav>
  )
}
