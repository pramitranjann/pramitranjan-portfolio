'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { ProjectCard } from '@/components/ProjectCard'
import { RuleLabel } from '@/components/RuleLabel'
import type { CardStyleSettings, CaseStudyContent, HoverPreviewSettings } from '@/lib/site-content-schema'

// The /work grid uses two-word tags; a case study's full tag list is far too
// long for a card and wraps to three lines.
const CARD_TAGS: Record<string, string[]> = {
  'swipey-fields': ['PRODUCT', 'AI'],
  'swipey-admin': ['PRODUCT', 'MOBILE'],
  'swipey-get-started': ['PRODUCT', 'ONBOARDING'],
}

// Entering/exiting → ease-out; modals sit in the 200–500ms band.
// (agent-system/core/CRAFT.md)
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)'
const ENTER_MS = 260

// Equal inset on all four sides, so the frame is centred in the viewport.
const FRAME_INSET = 'clamp(16px, 3.5vw, 56px)'

type Story = CaseStudyContent & { navStyle?: unknown; listeningStyle?: unknown }

function StoryFrame({ story, onClose }: { story: Story; onClose: () => void }) {
  const frameRef = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Lock body scroll, compensating for the scrollbar so the page behind doesn't
  // shift sideways as the frame opens.
  useEffect(() => {
    const { body, documentElement } = document
    const gap = window.innerWidth - documentElement.clientWidth
    const prevOverflow = body.style.overflow
    const prevPad = body.style.paddingRight
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`
    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPad
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey, true)
    frameRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey, true)
  }, [onClose])

  // The section nav scrolls the window, which is not the scroller in here, so
  // its links do nothing. Re-point them at the frame. Nav items and sections
  // are matched by order rather than by parsing labels into ids.
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const item = target.closest('.case-study-section-nav button, .case-study-section-nav a')
      if (!item) return
      const nav = item.closest('.case-study-section-nav')
      if (!nav) return
      const items = [...nav.querySelectorAll('button, a')]
      const sections = [...frame.querySelectorAll('[id^="sec-"]')].filter((el) => el.id !== 'sec-hero')
      const section = sections[items.indexOf(item)]
      if (!section) return
      event.preventDefault()
      event.stopPropagation()
      frame.scrollTo({ top: (section as HTMLElement).offsetTop - 96, behavior: 'smooth' })
    }
    frame.addEventListener('click', onClick, true)
    return () => frame.removeEventListener('click', onClick, true)
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={story.title}
      onMouseDown={(event) => {
        // Click anywhere outside the frame closes it.
        if (event.target === event.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        padding: FRAME_INSET,
        background: 'rgba(6, 6, 6, 0.66)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        opacity: shown ? 1 : 0,
        transition: `opacity ${ENTER_MS}ms ${EASE_OUT}`,
      }}
    >
      <div
        ref={frameRef}
        tabIndex={-1}
        className="swipey-frame"
        style={{
          position: 'relative',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          background: '#0d0d0d',
          border: '1px solid var(--color-red)',
          outline: 'none',
          // Never from scale(0) — enter from near-rest.
          transform: shown ? 'scale(1)' : 'scale(0.985)',
          opacity: shown ? 1 : 0,
          transition: `transform ${ENTER_MS}ms ${EASE_OUT}, opacity ${ENTER_MS}ms ${EASE_OUT}`,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${story.title}`}
          className="font-mono"
          style={{
            position: 'sticky',
            top: 0,
            float: 'right',
            zIndex: 5,
            padding: '20px 24px',
            border: 0,
            background: 'transparent',
            color: 'var(--color-red)',
            cursor: 'pointer',
            fontSize: 'var(--text-meta)',
            letterSpacing: '0.14em',
            lineHeight: 1,
          }}
        >
          CLOSE ×
        </button>
        <CaseStudyLayout
          {...(story as Parameters<typeof CaseStudyLayout>[0])}
          backHref="/work/swipey"
          backLabel="SWIPEY"
        />
      </div>
    </div>
  )
}

export function SwipeyHubClient({
  stories,
  cardStyle,
  hoverPreviewSettings,
}: {
  stories: Story[]
  cardStyle: CardStyleSettings
  hoverPreviewSettings: HoverPreviewSettings
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const close = useCallback(() => {
    const slug = openSlug
    setOpenSlug(null)
    // Focus returns to the card that opened it.
    if (slug) {
      requestAnimationFrame(() => cardRefs.current[slug]?.querySelector('a')?.focus())
    }
  }, [openSlug])

  const open = stories.find((story) => story.slug === openSlug) ?? null

  return (
    <>
      <Nav />
      {/* Clears the fixed nav, matching WorkPageClient. */}
      <main style={{ paddingTop: '57px' }}>
        <div style={{ padding: '24px var(--layout-page-gutter) 0' }}>
          <Link href="/work" className="font-mono back-link" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.14em' }}>
            <span className="arrow-nudge-back">←</span> WORK
          </Link>
        </div>

        {/* Hero — 50/50 grid, matching the case study hero exactly */}
        <section className="case-study-hero grid grid-cols-2 border-b border-divider" style={{ minHeight: '280px' }}>
          <div
            className="case-study-hero-text flex flex-col justify-end border-r border-divider"
            style={{ padding: '48px var(--layout-page-gutter)' }}
          >
            <RuleLabel number="PRODUCT DESIGN · 2026" />
            <h1
              className="font-serif"
              style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-serif)', color: 'var(--color-heading)', lineHeight: 1.1 }}
            >
              Swipey
            </h1>
            <p
              className="font-reading mt-3"
              style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: 'var(--color-heading)', lineHeight: 1.6 }}
            >
              Three months designing corporate card software for Malaysian SMEs.
            </p>
          </div>
          <div className="case-study-hero-image" style={{ position: 'relative', backgroundColor: '#111111', overflow: 'hidden', minHeight: '280px' }}>
            <Image src="/work/swipey-fields/cover.png" alt="Swipey" fill style={{ objectFit: 'cover', objectPosition: 'center' }} sizes="50vw" />
          </div>
        </section>

        <section style={{ padding: 'var(--layout-section-padding-y) var(--layout-page-gutter)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--layout-card-gap)' }}>
            {stories.map((story) => (
              <div
                key={story.slug}
                ref={(node) => {
                  cardRefs.current[story.slug] = node
                }}
                onClickCapture={(event) => {
                  // The card is a Link; intercept so it opens as a frame
                  // instead of navigating to a route that intentionally 404s.
                  event.preventDefault()
                  event.stopPropagation()
                  setOpenSlug(story.slug)
                }}
              >
                <ProjectCard
                  title={story.title}
                  oneliner={story.oneliner}
                  tags={CARD_TAGS[story.slug] ?? story.tags.slice(0, 2)}
                  href={`/work/${story.slug}`}
                  variant="supporting"
                  cover={story.heroImage}
                  coverPosition={story.cardImagePosition}
                  imageRatio={cardStyle.imageRatio}
                  titleSize={cardStyle.titleSize}
                  metaSize={cardStyle.metaSize}
                  cardPadding={cardStyle.cardPadding}
                  imageFit={cardStyle.imageFit}
                  imageBackground={cardStyle.imageBackground}
                  imageBorderColor={cardStyle.imageBorderColor}
                  imageBorderWidth={cardStyle.imageBorderWidth}
                  hoverPreviewSettings={hoverPreviewSettings}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      {open ? <StoryFrame story={open} onClose={close} /> : null}
    </>
  )
}
