'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Section = { id: string; label: string }

export function CaseStudyNav({ backHref = '/work', backLabel = 'WORK' }: { backHref?: string; backLabel?: string }) {
  // Derived from the DOM, not hardcoded: EditorialCaseStudy emits a different
  // set per case study (Redesign / Live / Solution), so a fixed list rendered a
  // dead button on every page that wasn't Franklin's.
  const [sections, setSections] = useState<Section[]>([])
  const [activeId, setActiveId] = useState('')
  const [visible, setVisible] = useState(false)

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

    const onScroll = () => {
      const heroCopy = document.querySelector('.editorial-hero-copy')
      const activationLine = window.innerWidth <= 768 ? 65 : 220
      const revealThreshold = window.innerWidth <= 768 ? 12 : 72
      const active = targets.reduce<HTMLElement>((current, target) => (
        target.getBoundingClientRect().top <= activationLine ? target : current
      ), targets[0])

      setVisible((heroCopy?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY) <= revealThreshold)
      setActiveId(active.id)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [sections])

  if (sections.length < 2) return null

  return (
    <nav
      className="case-study-section-nav editorial-case-study-nav"
      aria-label="Case study sections"
      data-visible={visible || undefined}
    >
      <span className="font-mono editorial-case-study-nav-title">CONTENTS</span>
      {sections.map((section, index) => {
        const isActive = activeId === section.id

        return (
          <button
            key={section.id}
            type="button"
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
