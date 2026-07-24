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

// Every embed occupies the same box whatever shape its prototype is, so the
// modal reads consistently across the three stories. The transactions
// prototype set these dimensions: it gives its row scroller the viewport
// height minus ~266px of chrome at ~115px a row, so 730 lands on 4 rows.
const STAGE = { w: 1440, h: 730 }

// Each prototype renders at its own viewport — rendering it at its design size
// and scaling the whole thing down keeps its layout decisions intact, where
// letterboxing it into an arbitrary box just makes it crop itself. `stage`
// marks one narrower than the box: it sits centred on a tinted backdrop of the
// canonical size instead of being stretched to fill it.
const DESIGN_SIZE: Record<string, { w: number; h: number; stage?: string }> = {
  'custom-fields': { w: 1440, h: 730 },
  'swipey-demo': { w: 1440, h: 730 },
  'swipey-admin': { w: 430, h: 932, stage: '#e4edeb' },
  'card-rename': { w: 520, h: 880, stage: '#e4edeb' },
}

function designSizeFor(url?: string) {
  const key = Object.keys(DESIGN_SIZE).find((k) => url?.includes(`/proto/${k}/`))
  return key ? DESIGN_SIZE[key] : { w: STAGE.w, h: STAGE.h }
}

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

  // Render the prototype at its own design viewport, then zoom the whole thing
  // to fit the frame. Measured rather than guessed in CSS, because the scale
  // depends on the frame's width and the prototype's native size.
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const fit = () => {
      const iframe = frame.querySelector('iframe')
      const host = iframe?.parentElement
      if (!iframe || !host) return
      const { w, h, stage } = designSizeFor(iframe.getAttribute('src') ?? undefined)
      // host is the inner surface; its parent carries the aspect-ratio and the
      // 12px padding that frames the embed on all four sides.
      const outer = host.parentElement
      const availableW = host.clientWidth
      if (availableW <= 0) return

      // The stage is the same box for every story: canonical ratio, scaled to
      // the width available.
      const stageScale = Math.min(availableW / STAGE.w, 1)
      const stageH = STAGE.h * stageScale

      // A full-width prototype fills the stage. A narrow one (the phone, the
      // rename panel) is scaled to fit the stage's height and centred on a
      // tinted backdrop — stretching it to the box width would distort it.
      const scale = stage
        ? Math.min((stageH - 24) / h, availableW / w, 1)
        : Math.min(availableW / w, 1)

      // transform, not zoom. Safari applies zoom to an iframe's internal
      // viewport as well as its box, so a zoomed 1440px iframe actually laid
      // out at ~1000px and the prototype wrapped and clipped itself. transform
      // leaves the internal viewport at the CSS width in every browser.
      iframe.style.setProperty('width', `${w}px`, 'important')
      iframe.style.setProperty('height', `${h}px`, 'important')
      iframe.style.removeProperty('zoom')
      iframe.style.setProperty('transform', `scale(${scale})`)
      iframe.style.setProperty('transform-origin', 'top left')
      const renderedW = w * scale
      const renderedH = h * scale

      // The aspect-ratio lives on the OUTER wrapper, so sizing the inner one
      // left the outer box reserving its full 16:10 height — that was the dead
      // space underneath. Release the ratio and let both hug the embed; the
      // outer wrapper's own 12px padding then reads evenly on all four sides.
      if (outer) {
        outer.style.setProperty('aspect-ratio', 'auto', 'important')
        outer.style.setProperty('height', 'auto', 'important')
      }
      // Always the stage height, so all three embeds are the same size.
      host.style.setProperty('height', `${stageH}px`, 'important')

      if (stage) {
        // Grid centring works because the negative margins below collapse the
        // iframe's layout box down to its rendered size.
        host.style.setProperty('background', stage, 'important')
        host.style.setProperty('display', 'grid', 'important')
        host.style.setProperty('place-items', 'center', 'important')
      } else {
        host.style.removeProperty('background')
        host.style.removeProperty('display')
        host.style.removeProperty('place-items')
      }

      // transform doesn't shrink the layout box, so pull the leftover back in.
      iframe.style.setProperty('margin-right', `${-(w - renderedW)}px`, 'important')
      iframe.style.setProperty('margin-bottom', `${-(h - renderedH)}px`, 'important')
    }

    // Watch the host, not just the frame: the iframe's wrapper can gain width
    // after first paint (it is hidden below md), and a bail-out on width 0 with
    // nothing observing it leaves the iframe at CaseStudyLayout's inline
    // width:100% — a narrow viewport that makes the prototype wrap to pieces.
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(frame)
    const iframe = frame.querySelector('iframe')
    if (iframe?.parentElement) ro.observe(iframe.parentElement)
    iframe?.addEventListener('load', fit)
    const retry = setTimeout(fit, 250)
    return () => {
      ro.disconnect()
      iframe?.removeEventListener('load', fit)
      clearTimeout(retry)
    }
  }, [story.slug])

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
        style={{
          position: 'relative',
          height: '100%',
          // Never from scale(0) — enter from near-rest.
          transform: shown ? 'scale(1)' : 'scale(0.985)',
          opacity: shown ? 1 : 0,
          transition: `transform ${ENTER_MS}ms ${EASE_OUT}, opacity ${ENTER_MS}ms ${EASE_OUT}`,
        }}
      >
        <div
          ref={frameRef}
          tabIndex={-1}
          className="swipey-frame"
          style={{
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            background: '#0d0d0d',
            border: '1px solid var(--color-red)',
            outline: 'none',
          }}
        >
          <CaseStudyLayout
            {...(story as Parameters<typeof CaseStudyLayout>[0])}
            backHref="/work/swipey"
            backLabel="SWIPEY"
          />
        </div>
        {/* Outside the scroller, so it can't ride over the content beneath it. */}
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${story.title}`}
          className="font-mono"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            width: 36,
            height: 36,
            display: 'grid',
            placeItems: 'center',
            border: '1px solid var(--color-red)',
            background: 'rgba(13, 13, 13, 0.92)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            color: 'var(--color-red)',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ×
        </button>
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
