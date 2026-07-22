'use client'
// Preview of the proposed case study pacing system, built on the existing
// primitives (Nav, Footer, RuleLabel, GsapReveal, tokens). If approved, the
// new blocks fold into CaseStudyLayout as opt-in sections and the diagram
// data moves into the site-content schema.
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { RuleLabel } from './RuleLabel'
import { ReadingProgress } from './ReadingProgress'
import { GsapReveal } from './GsapReveal'
import { playNav } from '@/lib/sounds'

interface FranklinsV2ClientProps {
  caseStudy: {
    title: string
    oneliner: string
    type: string
    tags: string[]
    next: { slug: string; title: string } | null
    problem?: string
    problemHeadline?: string
    role?: string
    roleHeadline?: string
    research?: string
    researchHeadline?: string
    challenge?: string
    challengeHeadline?: string
    process?: string
    processHeadline?: string
    usabilityTesting?: string
    solution?: string
    solutionHeadline?: string
    outcomes?: string
    outcomesHeadline?: string
    pullQuote?: string
    heroImage?: string
  }
}

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--text-eyebrow)',
  color: 'var(--color-red)',
  letterSpacing: '0.16em',
  lineHeight: 1,
}

const gridStyle: React.CSSProperties = {
  gridTemplateColumns: '1fr 2fr',
  gap: '48px',
}

const headlineStyle: React.CSSProperties = {
  fontSize: 'var(--text-body-lg, 16px)',
  letterSpacing: '0.01em',
  color: 'var(--color-heading)',
  lineHeight: 1.55,
  marginBottom: '10px',
}

const bodyStyle: React.CSSProperties = {
  fontSize: 'var(--text-body)',
  letterSpacing: '0.04em',
  color: 'var(--color-body)',
  lineHeight: 1.8,
}

const captionStyle: React.CSSProperties = {
  fontSize: 'var(--text-meta)',
  letterSpacing: '0.06em',
  color: 'var(--color-label)',
  lineHeight: 1.6,
}

const diagramBoxStyle: React.CSSProperties = {
  border: '1px solid var(--color-cardborder)',
}

// ponytail: mockup-only structured data, moves to site-content schema on approval
const JOURNEY = [
  {
    stage: 'STAGE 01',
    title: 'DISCOVER',
    steps: [
      { text: 'Finds an outdated website — old menu, no prices, hours unconfirmed.', friction: true },
      { text: "Can't tell if it's table service or counter service.", friction: true },
      { text: 'Checks photos on Maps instead, gives up on the site.', friction: false },
    ],
  },
  {
    stage: 'STAGE 02',
    title: 'PLAN',
    steps: [
      { text: 'Unsure about seating — will there be room to work?', friction: true },
      { text: "Asks a friend who's been. Word of mouth fills the gap the site left.", friction: false },
    ],
  },
  {
    stage: 'STAGE 03',
    title: 'ARRIVE',
    steps: [
      { text: 'Hesitates at the door — where to order, where to sit?', friction: true },
      { text: 'Staff warmth takes over. The in-person experience recovers the visit.', friction: false },
    ],
  },
  {
    stage: 'STAGE 04',
    title: 'ORDER + STAY',
    steps: [
      { text: 'Orders at the counter, finds a seat, stays longer than planned.', friction: false },
      { text: 'Would come back — and tells the next first-timer what to expect.', friction: false },
    ],
  },
]

const OLD_NAV_ITEMS = ['Our Story', 'Catering', 'Beverages', 'Food Program', 'Press', 'Gift Cards', 'Events', 'Wholesale', 'FAQ']

const BUCKETS = [
  { name: 'MENU', items: ['Coffee + drinks', 'Food, baked daily', 'Prices up front'] },
  { name: 'ORDER', items: ['Start an order', 'Customize', 'Pickup details'] },
  { name: 'ABOUT', items: ['The space + seating', 'Service model', 'Story, briefly'] },
  { name: 'CONTACT', items: ['Hours + location', 'Get in touch'] },
]

const FLOW_STEPS = [
  { num: '01', name: 'DISCOVER', desc: 'Menu with prices — the top task from research, one click from anywhere.' },
  { num: '02', name: 'CUSTOMIZE', desc: 'Size, milk, syrup as explicit choices — no hidden options at the counter.' },
  { num: '03', name: 'REVIEW', desc: 'Full order visible before commitment, with pickup expectations set.' },
  { num: '04', name: 'CHECKOUT', desc: "Progress cues throughout — you always know which step you're on." },
]

const PEEK_ANNOTATIONS: { label: string; top?: string; left?: string; right?: string; bottom?: string }[] = [
  { label: '↓ TASK-BASED NAV — 4 ITEMS', top: '1.5%', left: '40%' },
  { label: '↑ ORDER ENTRY, ONE STEP IN', top: '16%', right: '2%' },
  { label: 'PRACTICAL EXPECTATIONS FIRST →', top: '67%', left: '20%' },
]

const SOLUTION_SCREENS = [
  { src: '/work/franklins/Home Page.png', caption: 'Homepage — practical expectations before brand story.' },
  { src: '/work/franklins/Menu.png', caption: 'Menu — prices visible, categories by task, not department.' },
  { src: '/work/franklins/About Us.png', caption: 'About — the space, seating, and service model up front.' },
]

function ScreenFrame({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1440 / 1024',
        backgroundColor: '#ffffff',
        border: '1px solid var(--color-cardborder)',
        overflow: 'hidden',
      }}
    >
      <Image src={src} alt={alt} fill priority={priority} style={{ objectFit: 'contain' }} sizes="(max-width: 860px) 100vw, 60vw" />
    </div>
  )
}

export function FranklinsV2Client({ caseStudy }: FranklinsV2ClientProps) {
  const statementTrackRef = useRef<HTMLDivElement>(null)
  const statementRef = useRef<HTMLParagraphElement>(null)

  // Scroll-linked word fill on the key-insight statement.
  useEffect(() => {
    const track = statementTrackRef.current
    const statement = statementRef.current
    if (!track || !statement) return

    const words = Array.from(statement.querySelectorAll<HTMLElement>('[data-word]'))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      words.forEach((w) => w.classList.add('fv2-lit'))
      return
    }

    let frame = 0
    const update = () => {
      frame = 0
      const rect = track.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      if (total <= 0) return
      const progress = Math.max(0, Math.min(1, -rect.top / (total * 0.82)))
      const lit = Math.round(progress * words.length)
      words.forEach((w, i) => w.classList.toggle('fv2-lit', i < lit))
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  const statementWords = (caseStudy.pullQuote ?? '').split(' ')
  // Last four words carry the accent: "before they arrived."
  const accentFrom = Math.max(0, statementWords.length - 4)

  return (
    <>
      <ReadingProgress />
      <Nav />
      <main style={{ paddingTop: '57px' }}>
        {/* Back link */}
        <div style={{ padding: '24px var(--layout-page-gutter) 0' }}>
          <Link
            href="/work"
            className="font-mono"
            style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: 'var(--back-link-color)', textDecoration: 'none' }}
            onPointerDown={playNav}
          >
            <span className="arrow-nudge-back">←</span> WORK
          </Link>
        </div>

        {/* Hero — unchanged from current layout */}
        <section className="case-study-hero grid grid-cols-2 border-b border-divider" style={{ minHeight: '280px' }}>
          <div className="case-study-hero-text flex flex-col justify-end border-r border-divider" style={{ padding: '48px var(--layout-page-gutter)' }}>
            <RuleLabel number={caseStudy.type} />
            <h1 className="font-serif" style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-serif)', color: 'var(--color-heading)', lineHeight: 1.1 }}>
              {caseStudy.title}
            </h1>
            <p className="font-mono mt-3" style={{ ...bodyStyle, letterSpacing: '0.04em', lineHeight: 1.6, color: 'var(--color-label)' }}>
              {caseStudy.oneliner}
            </p>
          </div>
          <div className="case-study-hero-image" style={{ position: 'relative', backgroundColor: '#FFFFFF', overflow: 'hidden', minHeight: '280px' }}>
            {caseStudy.heroImage && <Image src={caseStudy.heroImage} alt={caseStudy.title} fill priority style={{ objectFit: 'contain' }} sizes="50vw" />}
          </div>
        </section>

        {/* Problem — current ledger style */}
        <section className="case-study-section border-b border-divider" style={{ padding: 'var(--layout-compact-section-padding-y) var(--layout-page-gutter)' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
              <span className="font-mono" style={labelStyle}>PROBLEM_</span>
              <div style={{ maxWidth: '640px' }}>
                <p className="font-mono" style={headlineStyle}>{caseStudy.problemHeadline}</p>
                <p className="font-mono" style={bodyStyle}>{caseStudy.problem}</p>
              </div>
            </div>
          </GsapReveal>
        </section>

        {/* My Role — current ledger style */}
        <section className="case-study-section border-b border-divider" style={{ padding: 'var(--layout-compact-section-padding-y) var(--layout-page-gutter)' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
              <span className="font-mono" style={labelStyle}>MY ROLE_</span>
              <div>
                <p className="font-mono" style={headlineStyle}>{caseStudy.roleHeadline}</p>
                <p className="font-mono mb-6" style={{ ...bodyStyle, maxWidth: '640px' }}>{caseStudy.role}</p>
                <div className="flex flex-wrap gap-2">
                  {caseStudy.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono"
                      style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.12em', color: 'var(--color-label)', border: '1px solid #1f1f1f', padding: '4px 10px' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </GsapReveal>
        </section>

        {/* NEW — Solution peek: the shipped screen, annotated, before the research */}
        <section className="case-study-section border-b border-divider" style={{ padding: 'var(--layout-compact-section-padding-y) var(--layout-page-gutter)' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
              <span className="font-mono" style={labelStyle}>WHERE WE LANDED_</span>
              <div style={{ maxWidth: '640px' }}>
                <p className="font-mono" style={headlineStyle}>The redesign, up front. The research explains why it looks this way.</p>
              </div>
            </div>
            <div data-reveal className="fv2-peek" style={{ position: 'relative', maxWidth: '1060px', margin: '32px auto 0' }}>
              {PEEK_ANNOTATIONS.map((a) => (
                <span
                  key={a.label}
                  className="font-mono fv2-annotation"
                  style={{
                    position: 'absolute',
                    zIndex: 2,
                    top: a.top,
                    left: a.left,
                    right: a.right,
                    bottom: a.bottom,
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-red)',
                    color: 'var(--color-red)',
                    fontSize: '10px',
                    letterSpacing: '0.14em',
                    padding: '5px 9px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {a.label}
                </span>
              ))}
              <ScreenFrame src="/work/franklins/Home Page.png" alt="Franklin's redesigned homepage" priority />
              <p className="font-mono" style={{ ...captionStyle, marginTop: '14px' }}>
                The shipped homepage. Four-item navigation, hours and service model surfaced before anything else — every choice traces back to a finding.
              </p>
            </div>
          </GsapReveal>
        </section>

        {/* Research — ledger text + NEW journey map diagram */}
        <section className="case-study-section border-b border-divider" style={{ padding: 'var(--layout-compact-section-padding-y) var(--layout-page-gutter)' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
              <span className="font-mono" style={labelStyle}>RESEARCH_</span>
              <div style={{ maxWidth: '640px' }}>
                <p className="font-mono" style={headlineStyle}>{caseStudy.researchHeadline}</p>
                <p className="font-mono" style={bodyStyle}>{caseStudy.research}</p>
              </div>
            </div>
            <div data-reveal style={{ maxWidth: '1120px', margin: '40px auto 0', overflowX: 'auto' }}>
              <div className="fv2-journey" style={{ ...diagramBoxStyle, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(210px, 1fr))', minWidth: '880px' }}>
                {JOURNEY.map((col, colIdx) => (
                  <div key={col.title} style={{ borderRight: colIdx < JOURNEY.length - 1 ? '1px solid var(--color-cardborder)' : 'none' }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-cardborder)', background: 'var(--color-card)' }}>
                      <div className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.16em', color: 'var(--color-meta)' }}>{col.stage}</div>
                      <div className="font-mono" style={{ fontSize: '13px', letterSpacing: '0.1em', color: 'var(--color-heading)', marginTop: '4px' }}>{col.title}</div>
                    </div>
                    <div style={{ padding: '12px 14px 14px', display: 'grid', gap: '10px' }}>
                      {col.steps.map((step) => (
                        <div
                          key={step.text}
                          className="font-mono"
                          style={{
                            border: '1px solid var(--color-cardborder)',
                            borderLeft: step.friction ? '2px solid var(--color-red)' : '1px solid var(--color-cardborder)',
                            padding: '10px 12px',
                            fontSize: '12px',
                            lineHeight: 1.5,
                            color: 'var(--color-body)',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {step.friction && (
                            <span style={{ display: 'block', fontSize: '9px', letterSpacing: '0.16em', color: 'var(--color-red)', marginBottom: '4px' }}>FRICTION</span>
                          )}
                          {step.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="font-mono" style={{ ...captionStyle, marginTop: '14px' }}>
                Contextual inquiry, redrawn as a first-visit journey. Four of five friction points sit before the door — the digital gap, not the café.
              </p>
            </div>
          </GsapReveal>
        </section>

        {/* NEW — Key insight as a full-viewport statement */}
        <div ref={statementTrackRef} className="fv2-statement-track border-b border-divider" style={{ height: '220vh', position: 'relative' }}>
          <div className="fv2-statement-pin" style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 var(--layout-page-gutter)' }}>
            <span className="font-mono" style={{ ...labelStyle, marginBottom: '28px' }}>KEY INSIGHT_</span>
            <p
              ref={statementRef}
              className="font-serif"
              style={{
                fontSize: 'clamp(32px, 5vw, 58px)',
                fontWeight: 'var(--font-weight-serif)',
                lineHeight: 1.2,
                textAlign: 'center',
                maxWidth: '900px',
                margin: 0,
              }}
            >
              {statementWords.map((word, i) => (
                <span key={`${word}-${i}`} data-word className={i >= accentFrom ? 'fv2-word fv2-accent' : 'fv2-word'}>
                  {word}{' '}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* Challenge — ledger text + NEW card-sort diagram */}
        <section className="case-study-section border-b border-divider" style={{ padding: 'var(--layout-compact-section-padding-y) var(--layout-page-gutter)' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
              <span className="font-mono" style={labelStyle}>CHALLENGE_</span>
              <div style={{ maxWidth: '640px' }}>
                <p className="font-mono" style={headlineStyle}>{caseStudy.challengeHeadline}</p>
                <p className="font-mono" style={bodyStyle}>{caseStudy.challenge}</p>
              </div>
            </div>
            <div data-reveal className="fv2-sort" style={{ maxWidth: '1060px', margin: '40px auto 0', display: 'grid', gridTemplateColumns: '1fr 72px 1.4fr', alignItems: 'stretch' }}>
              <div style={{ ...diagramBoxStyle, padding: '20px' }}>
                <div className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.18em', color: 'var(--color-label)', marginBottom: '16px' }}>BEFORE — THE OLD SITE&apos;S MENU</div>
                <div>
                  {OLD_NAV_ITEMS.map((item) => (
                    <span
                      key={item}
                      className="font-mono"
                      style={{
                        display: 'inline-block',
                        fontSize: '12px',
                        letterSpacing: '0.06em',
                        color: 'var(--color-label)',
                        border: '1px solid var(--color-cardborder)',
                        padding: '5px 10px',
                        margin: '0 6px 8px 0',
                        textDecoration: 'line-through',
                        textDecorationColor: 'rgba(255, 49, 32, 0.55)',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p className="font-mono" style={{ ...captionStyle, marginTop: '12px' }}>
                  Nine items organised the way the business is structured — not the way a visitor thinks.
                </p>
              </div>
              <div className="fv2-sort-arrow font-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-red)', fontSize: '18px' }}>→</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {BUCKETS.map((bucket) => (
                  <div key={bucket.name} style={{ ...diagramBoxStyle, background: 'var(--color-card)', padding: '16px 18px' }}>
                    <div className="font-mono" style={{ fontSize: '13px', letterSpacing: '0.16em', color: 'var(--color-heading)', borderBottom: '1px solid var(--color-divider)', paddingBottom: '9px', marginBottom: '9px' }}>
                      <span style={{ color: 'var(--color-red)' }}>→ </span>{bucket.name}
                    </div>
                    {bucket.items.map((item) => (
                      <div key={item} className="font-mono" style={{ fontSize: '12px', color: 'var(--color-label)', letterSpacing: '0.04em', lineHeight: 2 }}>{item}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <p data-reveal className="font-mono" style={{ ...captionStyle, maxWidth: '1060px', margin: '14px auto 0' }}>
              Card sort output, redrawn. Four task buckets from participant groupings — this exact structure shipped as the site navigation.
            </p>
          </GsapReveal>
        </section>

        {/* Process — ledger text + NEW flow strip + usability note + real artifacts */}
        <section className="case-study-section border-b border-divider" style={{ padding: 'var(--layout-compact-section-padding-y) var(--layout-page-gutter)' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
              <span className="font-mono" style={labelStyle}>PROCESS_</span>
              <div style={{ maxWidth: '640px' }}>
                <p className="font-mono" style={headlineStyle}>{caseStudy.processHeadline}</p>
                <p className="font-mono" style={bodyStyle}>{caseStudy.process}</p>
              </div>
            </div>
            <div data-reveal className="fv2-flow" style={{ ...diagramBoxStyle, maxWidth: '1060px', margin: '40px auto 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {FLOW_STEPS.map((step, i) => (
                <div key={step.num} className="fv2-flow-step" style={{ borderRight: i < FLOW_STEPS.length - 1 ? '1px solid var(--color-cardborder)' : 'none', padding: '18px 18px 20px' }}>
                  <div className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.16em', color: 'var(--color-red)' }}>{step.num}</div>
                  <div className="font-mono" style={{ fontSize: '13px', color: 'var(--color-heading)', letterSpacing: '0.08em', marginTop: '8px' }}>{step.name}</div>
                  <div className="font-mono" style={{ fontSize: '12px', color: 'var(--color-label)', marginTop: '6px', lineHeight: 1.6, letterSpacing: '0.02em' }}>{step.desc}</div>
                </div>
              ))}
            </div>
            <div data-reveal className="fv2-receipt" style={{ ...diagramBoxStyle, background: 'var(--color-card)', maxWidth: '1060px', margin: '14px auto 0', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '20px', flexWrap: 'wrap' }}>
              <span className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.16em', color: 'var(--color-red)' }}>USABILITY TEST_</span>
              <span className="font-mono" style={{ fontSize: '13px', color: 'var(--color-body)', letterSpacing: '0.04em' }}>Full order, discovery to checkout: small cappuccino · skim milk · vanilla syrup</span>
              <span className="font-mono" style={{ fontSize: '13px', color: 'var(--color-heading)', letterSpacing: '0.04em' }}>Completed with no major breakdowns. The flow held; we didn&apos;t iterate.</span>
            </div>
            <div data-reveal className="grid grid-cols-2" style={{ maxWidth: '1060px', margin: '14px auto 0', gap: '10px' }}>
              <div style={{ position: 'relative', aspectRatio: '16 / 10', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-cardborder)', overflow: 'hidden' }}>
                <Image src="/work/franklins/franklins process 1.jpg" alt="Process artifact — synthesis" fill style={{ objectFit: 'contain' }} sizes="50vw" />
              </div>
              <div style={{ position: 'relative', aspectRatio: '16 / 10', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-cardborder)', overflow: 'hidden' }}>
                <Image src="/work/franklins/franklins process 2.jpg" alt="Process artifact — card sort session" fill style={{ objectFit: 'contain' }} sizes="50vw" />
              </div>
            </div>
          </GsapReveal>
        </section>

        {/* Solution — NEW sticky split with real screens */}
        <section className="fv2-split border-b border-divider" style={{ padding: 'var(--layout-compact-section-padding-y) var(--layout-page-gutter)', display: 'grid', gridTemplateColumns: '1fr 1.55fr', gap: '48px', alignItems: 'start' }}>
          <div className="fv2-split-rail" style={{ position: 'sticky', top: '120px' }}>
            <GsapReveal>
              <div data-reveal>
                <span className="font-mono" style={labelStyle}>SOLUTION_</span>
                <p className="font-mono" style={{ ...headlineStyle, marginTop: '24px' }}>{caseStudy.solutionHeadline}</p>
                <p className="font-mono" style={bodyStyle}>{caseStudy.solution}</p>
              </div>
            </GsapReveal>
          </div>
          <GsapReveal style={{ display: 'grid', gap: '24px' }}>
            {SOLUTION_SCREENS.map((screen) => (
              <div key={screen.src} data-reveal>
                <ScreenFrame src={screen.src} alt={screen.caption} />
                <p className="font-mono" style={{ ...captionStyle, marginTop: '10px' }}>{screen.caption}</p>
              </div>
            ))}
          </GsapReveal>
        </section>

        {/* Outcomes — current ledger style */}
        <section className="case-study-section border-b border-divider" style={{ padding: 'var(--layout-compact-section-padding-y) var(--layout-page-gutter)' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
              <span className="font-mono" style={labelStyle}>OUTCOMES_</span>
              <div style={{ maxWidth: '640px' }}>
                <p className="font-mono" style={headlineStyle}>{caseStudy.outcomesHeadline}</p>
                <p className="font-mono" style={bodyStyle}>{caseStudy.outcomes}</p>
              </div>
            </div>
          </GsapReveal>
        </section>

        {/* Prev / Next */}
        <div className="grid grid-cols-2 border-b border-divider">
          <div className="border-r border-divider" style={{ padding: '28px var(--layout-page-gutter)' }}>
            <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', color: 'var(--color-stagenum)' }}>—</span>
          </div>
          <div className="text-right" style={{ padding: '28px var(--layout-page-gutter)' }}>
            {caseStudy.next && (
              <Link href={`/work/${caseStudy.next.slug}`} className="block" onPointerDown={playNav}>
                <p className="font-mono mb-2" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.12em', color: 'var(--color-red)' }}>
                  NEXT <span className="arrow-nudge">→</span>
                </p>
                <p className="font-serif" style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-serif)', color: 'var(--color-label)' }}>
                  {caseStudy.next.title}
                </p>
              </Link>
            )}
          </div>
        </div>

        <p className="font-mono" style={{ ...captionStyle, color: 'var(--color-meta)', padding: '20px var(--layout-page-gutter) 60px' }}>
          V2 PREVIEW — proposed pacing system on the live layout primitives. On approval, blocks fold into CaseStudyLayout and diagram data moves to the dashboard.
        </p>
      </main>
      <Footer />

      {/* Scoped styles: statement fill states + responsive. Moves to globals.css on approval. */}
      <style>{`
        .fv2-word { color: #4a4a4a; transition: color 0.18s linear; }
        .fv2-word.fv2-lit { color: var(--color-heading); }
        .fv2-word.fv2-accent.fv2-lit { color: var(--color-red); }
        @media (prefers-reduced-motion: reduce) {
          .fv2-statement-track { height: auto !important; padding: 22vh 0; }
          .fv2-statement-pin { position: static !important; height: auto !important; }
          .fv2-word { color: var(--color-heading); }
          .fv2-word.fv2-accent { color: var(--color-red); }
        }
        @media (max-width: 860px) {
          .fv2-peek .fv2-annotation { position: static !important; display: inline-block; margin: 0 8px 8px 0; }
          .fv2-sort { grid-template-columns: 1fr !important; }
          .fv2-sort-arrow { padding: 12px 0; transform: rotate(90deg); }
          .fv2-flow { grid-template-columns: 1fr 1fr !important; }
          .fv2-flow-step:nth-child(2) { border-right: none !important; }
          .fv2-flow-step:nth-child(-n+2) { border-bottom: 1px solid var(--color-cardborder); }
          .fv2-split { grid-template-columns: 1fr !important; }
          .fv2-split-rail { position: static !important; }
        }
      `}</style>
    </>
  )
}
