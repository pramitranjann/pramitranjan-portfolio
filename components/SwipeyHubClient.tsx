'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { EditorialCaseStudy } from '@/components/EditorialCaseStudy'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { ProjectCard } from '@/components/ProjectCard'
import { RuleLabel } from '@/components/RuleLabel'
import type { CardStyleSettings, CaseStudyContent, HoverPreviewSettings } from '@/lib/site-content-schema'

// Three columns instead of /work's four makes each card 4/3 wider, so /work's
// 4:3 cover would be 4/3 taller too and push the page into a scroll. Widening
// the ratio by the same 4/3 — 4:3 → 16:9 — holds the cover at its /work height
// at any viewport, since both are proportional to card width.
const CARD_IMAGE_RATIO = '16 / 9'

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

// Fallback viewport for a prototype with no entry below. 730 comes from the
// transactions prototype: it gives its row scroller the viewport height minus
// ~266px of chrome at ~115px a row, so 730 lands on 4 visible rows.
const DEFAULT_SIZE = { w: 1440, h: 730 }

// Every prototype gets a wide viewport, including the phone and the rename
// panel. Both already draw their own backdrop and centre their content on it,
// so handing them the width lets them do that — wrapping a narrow one in a
// backdrop of ours just framed an already-framed thing. Their heights are
// their content's natural height; the scale fits that to the stage.
const DESIGN_SIZE: Record<string, { w: number; h: number }> = {
  'custom-fields': { w: 1440, h: 730 },
  'swipey-demo': { w: 1440, h: 800 },
  'swipey-admin': { w: 1440, h: 950 },
  'card-rename': { w: 1440, h: 900 },
}

function designSizeFor(url?: string) {
  const key = Object.keys(DESIGN_SIZE).find((k) => url?.includes(`/proto/${k}/`))
  return key ? DESIGN_SIZE[key] : DEFAULT_SIZE
}

type Story = CaseStudyContent & { navStyle?: unknown; listeningStyle?: unknown }

/* CaseStudyNav can't be reused here: it listens to window scroll (the
   body is locked while the frame is open, so it would never fire) and its
   section list is hardcoded to Franklin's ids. Same markup and classes, so the
   styling is shared — only the scroll source and the section list differ, and
   the list is read off whatever the story actually rendered. */
function FrameNav({
  frameRef,
  slug,
}: {
  frameRef: React.RefObject<HTMLDivElement | null>
  slug: string
}) {
  const [sections, setSections] = useState<{ id: string; label: string }[]>([])
  const [activeId, setActiveId] = useState('')
  const navRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    const found = Array.from(frame.querySelectorAll<HTMLElement>('section[id][data-section]'))
      // hero is the page header, not a chapter — CaseStudyNav skips it too
      .filter((el) => el.id !== 'overview')
    setSections(found.map((el) => ({ id: el.id, label: el.dataset.section ?? el.id })))
    if (!found.length) return
    setActiveId(found[0].id)

    const onScroll = () => {
      const frameTop = frame.getBoundingClientRect().top
      const active = found.reduce((current, el) => (
        el.getBoundingClientRect().top <= frameTop + 150 ? el : current
      ), found[0])
      const heroCopy = frame.querySelector('.editorial-hero-copy')
      setVisible((heroCopy?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY) <= frameTop + 72)
      setActiveId(active.id)
    }

    frame.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => frame.removeEventListener('scroll', onScroll)
  }, [frameRef, slug])

  // Keep the active button in frame while the pill scrolls horizontally,
  // matching CaseStudyNav and CaseStudyLayout.
  useEffect(() => {
    if (!activeId || !navRef.current) return
    const activeBtn = navRef.current.querySelector<HTMLElement>(`[data-nav-id="${activeId}"]`)
    activeBtn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeId])

  // A single section is a label, not navigation.
  if (sections.length < 2) return null

  return (
    <nav
      ref={navRef}
      className="editorial-case-study-nav swipey-frame-nav"
      aria-label={`${slug} sections`}
      data-visible={visible || undefined}
    >
      <span className="font-mono editorial-case-study-nav-title">CONTENTS</span>
      {sections.map((section, index) => (
        <button
          key={section.id}
          type="button"
          data-nav-id={section.id}
          className="font-mono editorial-case-study-nav-button"
          aria-current={activeId === section.id ? 'location' : undefined}
          data-active={activeId === section.id || undefined}
          data-last={index === sections.length - 1 || undefined}
          onClick={() => {
            const frame = frameRef.current
            // Scoped to the frame: the hub page behind it renders its own
            // #overview, so document.getElementById would find the wrong one.
            const target = frame?.querySelector<HTMLElement>(`#${section.id}`)
            if (!frame || !target) return
            const delta = target.getBoundingClientRect().top - frame.getBoundingClientRect().top
            frame.scrollTo({ top: Math.max(0, frame.scrollTop + delta - 40), behavior: 'smooth' })
          }}
        >
          {section.label}
          {activeId === section.id ? <span className="editorial-case-study-nav-indicator" aria-hidden="true" /> : null}
        </button>
      ))}
    </nav>
  )
}

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
      const { w, h } = designSizeFor(iframe.getAttribute('src') ?? undefined)
      // host is the inner surface; its parent carries the aspect-ratio and the
      // 12px padding that frames the embed on all four sides.
      const outer = host.parentElement
      const availableW = host.clientWidth
      if (availableW <= 0) return

      // Fill the width always, so each prototype's own backdrop spans the box.
      // Clamping to the stage height instead left the width unused and the
      // backdrop floating in the middle. Height follows the content, so the
      // phone's box is simply taller than the transactions one.
      const scale = Math.min(availableW / w, 1)

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
      host.style.setProperty('height', `${renderedH}px`, 'important')

      // Grid centring works because the negative margins below collapse the
      // iframe's layout box down to its rendered size.
      host.style.setProperty('display', 'grid', 'important')
      host.style.setProperty('place-items', 'center', 'important')

      // transform doesn't shrink the layout box, so pull the leftover back in.
      iframe.style.setProperty('margin-right', `${-(w - renderedW)}px`, 'important')
      iframe.style.setProperty('margin-bottom', `${-(h - renderedH)}px`, 'important')
    }

    // Watch the host, not just the frame: the iframe's wrapper can gain width
    // after first paint (it is hidden below md), and a bail-out on width 0 with
    // nothing observing it leaves the iframe at the layout's inline
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
        // The editorial layout sizes its hero in svh. Inside the frame that
        // overshoots by the inset, so hand the CSS the inset to subtract.
        ['--swipey-frame-inset' as string]: FRAME_INSET,
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
          <EditorialCaseStudy
            {...story}
            chrome={false}
            backHref="/work/swipey"
            backLabel="SWIPEY"
          />
        </div>
        {/* Outside the scroller: the wrapper's transform makes it the containing
            block for position:fixed, so the rail lands on the frame's edge. */}
        <FrameNav frameRef={frameRef} slug={story.slug} />
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
  coverImage,
  coverBackground,
  coverFit,
}: {
  stories: Story[]
  cardStyle: CardStyleSettings
  hoverPreviewSettings: HoverPreviewSettings
  coverImage: string
  coverBackground?: string
  coverFit?: 'cover' | 'contain'
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
      <main className="editorial-page">
        {/* Same hero markup as EditorialCaseStudy, so the flagship reads as one system */}
        <section id="overview" className="editorial-hero" data-section="Overview">
          <div className="editorial-shell editorial-hero-grid">
            <div className="editorial-hero-copy">
              <div className="editorial-back-row">
                <Link href="/work" className="font-mono editorial-back-link">
                  <span className="arrow-nudge-back">←</span> WORK
                </Link>
              </div>
              <div className="editorial-hero-lede">
                <p className="font-mono editorial-kicker">PRODUCT DESIGN · 2026</p>
                <h1 className="font-serif">Swipey</h1>
                <p className="font-reading editorial-oneliner">
                  Three case studies, spanning AI, mobile and onboarding.
                </p>
              </div>
              <div className="editorial-role-line">
                <span className="font-mono">ROLE</span>
                <p className="font-reading">
                  Design intern for three months at a Kuala Lumpur fintech, building corporate card
                  software for Malaysian SMEs. Small team, quick handoffs to the engineers — I built
                  these prototypes with AI agents to keep that pace.
                </p>
              </div>
            </div>
            <figure className="editorial-hero-image" style={{ backgroundColor: coverBackground || '#111111' }}>
              <Image src={coverImage} alt="Swipey" fill style={{ objectFit: coverFit ?? 'cover', objectPosition: 'center' }} sizes="(max-width: 900px) 100vw, 56vw" />
            </figure>
          </div>
        </section>

        <section className="editorial-section">
          {/* swipey-hub-shell: this hub has no CONTENTS rail, so the left column
              .editorial-shell reserves for one would read as dead space. */}
          <div className="swipey-hub-shell editorial-shell grid grid-cols-2 md:grid-cols-3" style={{ gap: 'var(--layout-card-gap)' }}>
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
                  imageRatio={CARD_IMAGE_RATIO}
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
