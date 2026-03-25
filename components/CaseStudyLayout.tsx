'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { RuleLabel } from './RuleLabel'
import { ReadingProgress } from './ReadingProgress'
import { useSiteCopy } from '@/components/SiteCopyProvider'
import { playNav } from '@/lib/sounds'
import { GsapReveal } from './GsapReveal'
import { deriveCaseStudyMediaBlocks } from '@/lib/case-study-media'
import type { CaseStudyMediaBlock, CaseStudyMediaSettings, CaseStudyUiCopy } from '@/lib/site-content-schema'

interface ProjectLink {
  slug: string
  title: string
}

interface CaseStudyLayoutProps {
  slug?: string
  section?: 'work' | 'mixed-media' | 'branding'
  title: string
  oneliner: string
  type: string
  tags: string[]
  prev: ProjectLink | null
  next: ProjectLink | null
  backHref?: string
  backLabel?: string
  problem?: string
  role?: string
  research?: string
  challenge?: string
  process?: string
  usabilityTesting?: string
  solution?: string
  outcomes?: string
  // Headlines — new
  problemHeadline?: string
  roleHeadline?: string
  researchHeadline?: string
  challengeHeadline?: string
  processHeadline?: string
  solutionHeadline?: string
  outcomesHeadline?: string
  pullQuote?: string
  // Images — unchanged
  heroImage?: string
  researchImage?: string
  challengeImages?: string[]
  solutionHeroImage?: string
  solutionImages?: string[]
  mediaSettings?: CaseStudyMediaSettings
  mediaBlocks?: CaseStudyMediaBlock[]
  uiCopy?: CaseStudyUiCopy
}

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--text-eyebrow)',
  color: '#FF3120',
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
  color: '#f5f2ed',
  lineHeight: 1.55,
  marginBottom: '10px',
}

function resolveMediaSlot(
  settings: CaseStudyMediaSettings['hero'] | CaseStudyMediaSettings['research'] | CaseStudyMediaSettings['solutionHero'],
  defaults: { height: string; fit: 'contain' | 'cover'; position: string; background: string }
) {
  return {
    height: settings?.height || defaults.height,
    fit: settings?.fit || defaults.fit,
    position: settings?.position || defaults.position,
    background: settings?.background || defaults.background,
  }
}

function resolveMediaPair(
  settings: CaseStudyMediaSettings['challengePair'] | CaseStudyMediaSettings['solutionPair'],
  defaults: { height: string; gap: string; fit: 'contain' | 'cover'; firstPosition: string; secondPosition: string; background: string }
) {
  return {
    height: settings?.height || defaults.height,
    gap: settings?.gap || defaults.gap,
    fit: settings?.fit || defaults.fit,
    firstPosition: settings?.firstPosition || defaults.firstPosition,
    secondPosition: settings?.secondPosition || defaults.secondPosition,
    background: settings?.background || defaults.background,
  }
}

function blockJustify(align?: CaseStudyMediaBlock['align']) {
  if (align === 'left') return 'flex-start'
  if (align === 'right') return 'flex-end'
  return 'center'
}

function renderMediaBlock(block: CaseStudyMediaBlock) {
  const images = block.images.filter((item) => item.src)
  if (!images.length) return null

  const columns = block.layout === 'pair' && images.length > 1 ? `repeat(${images.length}, minmax(0, 1fr))` : 'minmax(0, 1fr)'

  return (
    <div
      key={block.id}
      data-reveal
      style={{
        display: 'flex',
        justifyContent: blockJustify(block.align),
      }}
    >
      <div
        className="case-study-media-block"
        style={{
          width: block.width || '100%',
          display: 'grid',
          gridTemplateColumns: columns,
          gap: block.gap || '2px',
        }}
      >
        {images.map((image, index) => (
          <div
            key={`${block.id}-${index}`}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: image.aspectRatio || (block.layout === 'pair' ? '4 / 3' : '16 / 10'),
              backgroundColor: image.background || '#161616',
              border: '1px solid #1a1a1a',
              overflow: 'hidden',
            }}
          >
            <Image
              src={image.src}
              alt={image.alt || ''}
              fill
              style={{
                objectFit: image.fit || 'contain',
                objectPosition: image.position || 'center center',
              }}
              sizes={block.layout === 'pair' ? '50vw' : '100vw'}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CaseStudyLayout({
  slug = 'case-study',
  section = 'work',
  title, oneliner, type, tags, prev, next,
  backHref = '/work', backLabel = 'WORK',
  problem, role, research, challenge, process, usabilityTesting, solution, outcomes,
  problemHeadline, roleHeadline, researchHeadline, challengeHeadline,
  processHeadline, solutionHeadline, outcomesHeadline, pullQuote,
  heroImage, researchImage, challengeImages, solutionHeroImage, solutionImages, mediaSettings, mediaBlocks, uiCopy,
}: CaseStudyLayoutProps) {
  const basePath = backHref
  const copy = { ...useSiteCopy().caseStudy, ...uiCopy }
  const heroMedia = resolveMediaSlot(mediaSettings?.hero, {
    height: '280px',
    fit: 'contain',
    position: 'center center',
    background: '#161616',
  })
  const researchMedia = resolveMediaSlot(mediaSettings?.research, {
    height: '320px',
    fit: 'contain',
    position: 'center center',
    background: '#161616',
  })
  const challengeMedia = resolveMediaPair(mediaSettings?.challengePair, {
    height: '267px',
    gap: '2px',
    fit: 'contain',
    firstPosition: 'center center',
    secondPosition: 'center center',
    background: '#161616',
  })
  const solutionHeroMedia = resolveMediaSlot(mediaSettings?.solutionHero, {
    height: '480px',
    fit: 'contain',
    position: 'center center',
    background: '#161616',
  })
  const solutionPairMedia = resolveMediaPair(mediaSettings?.solutionPair, {
    height: '320px',
    gap: '2px',
    fit: 'contain',
    firstPosition: 'center center',
    secondPosition: 'center center',
    background: '#161616',
  })
  const caseStudyMediaBlocks = deriveCaseStudyMediaBlocks({
    slug,
    section,
    title,
    oneliner,
    type,
    tags,
    prev,
    next,
    backHref,
    backLabel,
    problem,
    role,
    research,
    challenge,
    process,
    usabilityTesting,
    solution,
    outcomes,
    problemHeadline,
    roleHeadline,
    researchHeadline,
    challengeHeadline,
    processHeadline,
    solutionHeadline,
    outcomesHeadline,
    pullQuote,
    heroImage,
    researchImage,
    challengeImages,
    solutionHeroImage,
    solutionImages,
    mediaSettings,
    mediaBlocks,
    uiCopy,
  })
  const researchBlocks = caseStudyMediaBlocks.filter((block) => block.section === 'research')
  const challengeBlocks = caseStudyMediaBlocks.filter((block) => block.section === 'challenge')
  const solutionBlocks = caseStudyMediaBlocks.filter((block) => block.section === 'solution')

  const navItems = [
    { id: 'sec-problem', label: copy.navProblemLabel, show: true },
    { id: 'sec-role', label: copy.navRoleLabel, show: true },
    { id: 'sec-research', label: copy.navResearchLabel, show: !!research },
    { id: 'sec-challenge', label: copy.navChallengeLabel, show: !!challenge },
    { id: 'sec-process', label: copy.navProcessLabel, show: !!(process || usabilityTesting) },
    { id: 'sec-solution', label: copy.navSolutionLabel, show: true },
    { id: 'sec-outcomes', label: copy.navOutcomesLabel, show: !!outcomes },
  ].filter(item => item.show)

  const [navVisible, setNavVisible] = useState(false)
  const [activeId, setActiveId]     = useState('')
  const scrollLocked = useRef(false)
  const lockTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const getActiveSection = () => {
      const sections = Array.from(document.querySelectorAll('section[id^="sec-"]'))
        .filter(el => el.id !== 'sec-hero')
      if (sections.length === 0) return null
      const lastSection = sections[sections.length - 1] ?? null
      const documentBottom = window.innerHeight + window.scrollY
      const remainingScroll = document.documentElement.scrollHeight - documentBottom

      if (
        lastSection &&
        remainingScroll <= 24 &&
        lastSection.getBoundingClientRect().top <= window.innerHeight * 0.6
      ) {
        return lastSection
      }
      const threshold = 110
      let active = sections[0] ?? null

      for (const el of sections) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= threshold) {
          active = el
        } else {
          break
        }
      }

      return active
    }

    const onScroll = () => {
      setNavVisible(window.scrollY > 100)
      // Don't update active section while a programmatic scroll is animating —
      // that's what causes the flickering between items on click.
      if (scrollLocked.current) return
      const active = getActiveSection()
      if (active) setActiveId(active.id)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (lockTimer.current) clearTimeout(lockTimer.current)
    }
  }, [copy.navChallengeLabel, copy.navOutcomesLabel, copy.navProblemLabel, copy.navProcessLabel, copy.navResearchLabel, copy.navRoleLabel, copy.navSolutionLabel])

  return (
    <>
      <ReadingProgress />
      <Nav />
      <main style={{ paddingTop: '57px' }}>

        {/* Back link */}
        <div className="case-study-back" style={{ padding: '24px 40px 0' }}>
          <Link
            href={backHref}
            className="font-mono"
            style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: '#666666', textDecoration: 'none' }}
            onPointerDown={playNav}
          >
            <span className="arrow-nudge-back">←</span> {backLabel}
          </Link>
        </div>

        {/* Hero — 50/50 grid */}
        <section
          id="sec-hero"
          className="case-study-hero grid grid-cols-2 border-b border-divider"
          style={{ minHeight: '280px' }}
        >
          <div
            className="case-study-hero-text flex flex-col justify-end border-r border-divider"
            style={{ padding: '48px 40px' }}
          >
            <RuleLabel number={type} />
            <h1
              className="font-serif"
              style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1 }}
            >
              {title}
            </h1>
            <p
              className="font-mono mt-3"
              style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#666666', lineHeight: 1.6 }}
            >
              {oneliner}
            </p>
          </div>
          <div className="case-study-hero-image" style={{ position: 'relative', backgroundColor: heroMedia.background, overflow: 'hidden', minHeight: heroMedia.height }}>
            {heroImage && <Image src={heroImage} alt={title} fill style={{ objectFit: heroMedia.fit, objectPosition: heroMedia.position }} sizes="50vw" />}
          </div>
        </section>

        {/* Problem */}
        <section id="sec-problem" data-section={copy.problemLabel} className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
              <span className="font-mono" style={labelStyle}>{copy.problemLabel}</span>
              <div style={{ maxWidth: '640px' }}>
                {problemHeadline && (
                  <p className="font-mono" style={headlineStyle}>{problemHeadline}</p>
                )}
                <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8 }}>
                  {problem ?? copy.defaultProblem}
                </p>
              </div>
            </div>
          </GsapReveal>
        </section>

        {/* My Role */}
        <section id="sec-role" data-section={copy.roleLabel} className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
              <span className="font-mono" style={labelStyle}>{copy.roleLabel}</span>
              <div>
                {roleHeadline && (
                  <p className="font-mono" style={headlineStyle}>{roleHeadline}</p>
                )}
                <p className="case-study-body font-mono mb-6" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '640px' }}>
                  {role ?? copy.defaultRole}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono"
                      style={{
                        fontSize: 'var(--text-eyebrow)',
                        letterSpacing: '0.12em',
                        color: '#666666',
                        border: '1px solid #1f1f1f',
                        padding: '4px 10px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </GsapReveal>
        </section>

        {/* Research */}
        {research && (
          <section id="sec-research" data-section={copy.researchLabel} className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
            <GsapReveal>
              <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
                <span className="font-mono" style={labelStyle}>{copy.researchLabel}</span>
                <div style={{ maxWidth: '640px' }}>
                  {researchHeadline && (
                    <p className="font-mono" style={headlineStyle}>{researchHeadline}</p>
                  )}
                  <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8 }}>
                    {research}
                  </p>
                </div>
              </div>
              {researchBlocks.length ? (
                <div className="mt-6" style={{ display: 'grid', gap: '14px' }}>
                  {researchBlocks.map(renderMediaBlock)}
                </div>
              ) : researchImage ? (
                <div data-reveal className="case-study-research-image w-full mt-6" style={{ position: 'relative', height: researchMedia.height, backgroundColor: researchMedia.background, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                  <Image src={researchImage} alt="Research" fill style={{ objectFit: researchMedia.fit, objectPosition: researchMedia.position }} sizes="100vw" />
                </div>
              ) : null}
            </GsapReveal>
          </section>
        )}

        {/* Pull Quote */}
        {pullQuote && (
          <div style={{
            padding: '44px 40px',
            borderLeft: '2px solid #FF3120',
            borderBottom: '1px solid var(--divider)',
          }}>
            <p className="font-serif" style={{ fontStyle: 'italic', fontSize: '28px', color: '#f5f2ed', maxWidth: '680px', lineHeight: 1.45 }}>
              {pullQuote}
            </p>
            <p className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', color: '#FF3120', letterSpacing: '0.16em', marginTop: '16px' }}>
              {copy.keyInsightLabel}
            </p>
          </div>
        )}

        {/* Challenge */}
        {challenge && (
          <section id="sec-challenge" data-section={copy.challengeLabel} className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
            <GsapReveal>
              <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
                <span className="font-mono" style={labelStyle}>{copy.challengeLabel}</span>
                <div style={{ maxWidth: '640px' }}>
                  {challengeHeadline && (
                    <p className="font-mono" style={headlineStyle}>{challengeHeadline}</p>
                  )}
                  <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8 }}>
                    {challenge}
                  </p>
                </div>
              </div>
              {challengeBlocks.length ? (
                <div className="mt-6" style={{ display: 'grid', gap: '14px' }}>
                  {challengeBlocks.map(renderMediaBlock)}
                </div>
              ) : challengeImages ? (
                <div data-reveal className="case-study-image-grid mt-6 grid grid-cols-2" style={{ gap: challengeMedia.gap }}>
                  <div className="case-study-ideation-image" style={{ position: 'relative', height: challengeMedia.height, backgroundColor: challengeMedia.background, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                    <Image src={challengeImages[0]} alt="Challenge 1" fill style={{ objectFit: challengeMedia.fit, objectPosition: challengeMedia.firstPosition }} sizes="50vw" />
                  </div>
                  <div className="case-study-ideation-image" style={{ position: 'relative', height: challengeMedia.height, backgroundColor: challengeMedia.background, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                    <Image src={challengeImages[1]} alt="Challenge 2" fill style={{ objectFit: challengeMedia.fit, objectPosition: challengeMedia.secondPosition }} sizes="50vw" />
                  </div>
                </div>
              ) : null}
            </GsapReveal>
          </section>
        )}

        {/* Process */}
        {(process || usabilityTesting) && (
          <section id="sec-process" data-section={copy.processLabel} className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
            <GsapReveal>
              <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
                <span className="font-mono" style={labelStyle}>{copy.processLabel}</span>
                <div>
                  {processHeadline && (
                    <p className="font-mono" style={{ ...headlineStyle, maxWidth: '640px' }}>{processHeadline}</p>
                  )}
                  {process && (
                    <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '640px' }}>
                      {process}
                    </p>
                  )}
                  {usabilityTesting && (
                    <p className="case-study-body font-mono mt-6" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '640px' }}>
                      {usabilityTesting}
                    </p>
                  )}
                </div>
              </div>
            </GsapReveal>
          </section>
        )}

        {/* Solution */}
        <section id="sec-solution" data-section={copy.solutionLabel} className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
              <span className="font-mono" style={labelStyle}>{copy.solutionLabel}</span>
              <div style={{ maxWidth: '640px' }}>
                {solutionHeadline && (
                  <p className="font-mono" style={headlineStyle}>{solutionHeadline}</p>
                )}
                <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8 }}>
                  {solution ?? ''}
                </p>
              </div>
            </div>
            {solutionBlocks.length ? (
              <div className="mt-6" style={{ display: 'grid', gap: '14px' }}>
                {solutionBlocks.map(renderMediaBlock)}
              </div>
            ) : (
              <>
                {solutionHeroImage && (
                  <div data-reveal className="case-study-solution-hero w-full mt-6 mb-1" style={{ position: 'relative', height: solutionHeroMedia.height, backgroundColor: solutionHeroMedia.background, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                    <Image src={solutionHeroImage} alt="Solution" fill style={{ objectFit: solutionHeroMedia.fit, objectPosition: solutionHeroMedia.position }} sizes="100vw" />
                  </div>
                )}
                {solutionImages && (solutionImages[0] || solutionImages[1]) && (
                  <div data-reveal className="case-study-image-grid grid grid-cols-2" style={{ gap: solutionPairMedia.gap }}>
                    <div className="case-study-solution-image" style={{ position: 'relative', height: solutionPairMedia.height, backgroundColor: solutionPairMedia.background, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                      {solutionImages[0] && <Image src={solutionImages[0]} alt="Solution 1" fill style={{ objectFit: solutionPairMedia.fit, objectPosition: solutionPairMedia.firstPosition }} sizes="50vw" />}
                    </div>
                    <div className="case-study-solution-image" style={{ position: 'relative', height: solutionPairMedia.height, backgroundColor: solutionPairMedia.background, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                      {solutionImages[1] && <Image src={solutionImages[1]} alt="Solution 2" fill style={{ objectFit: solutionPairMedia.fit, objectPosition: solutionPairMedia.secondPosition }} sizes="50vw" />}
                    </div>
                  </div>
                )}
              </>
            )}
          </GsapReveal>
        </section>

        {/* Outcomes */}
        {outcomes && (
          <section id="sec-outcomes" data-section={copy.outcomesLabel} className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
            <GsapReveal>
              <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
                <span className="font-mono" style={labelStyle}>{copy.outcomesLabel}</span>
                <div style={{ maxWidth: '640px' }}>
                  {outcomesHeadline && (
                    <p className="font-mono" style={headlineStyle}>{outcomesHeadline}</p>
                  )}
                  <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8 }}>
                    {outcomes}
                  </p>
                </div>
              </div>
            </GsapReveal>
          </section>
        )}

        {/* Prev / Next */}
        <div className="grid grid-cols-2 border-b border-divider">
          <div className="case-study-prev-next border-r border-divider" style={{ padding: '28px 40px' }}>
            {prev ? (
              <Link href={`${basePath}/${prev.slug}`} className="block" onPointerDown={playNav}>
                <p className="font-mono mb-2" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.12em', color: '#FF3120' }}>
                  <span className="arrow-nudge-back">←</span> {copy.prevLabel}
                </p>
                <p className="font-serif" style={{ fontSize: 'var(--text-body)', fontWeight: 400, color: '#666666' }}>
                  {prev.title}
                </p>
              </Link>
            ) : (
              <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', color: '#2a2a2a' }}>—</span>
            )}
          </div>
          <div className="case-study-prev-next text-right" style={{ padding: '28px 40px' }}>
            {next ? (
              <Link href={`${basePath}/${next.slug}`} className="block" onPointerDown={playNav}>
                <p className="font-mono mb-2" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.12em', color: '#FF3120' }}>
                  {copy.nextLabel} <span className="arrow-nudge">→</span>
                </p>
                <p className="font-serif" style={{ fontSize: 'var(--text-body)', fontWeight: 400, color: '#666666' }}>
                  {next.title}
                </p>
              </Link>
            ) : (
              <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', color: '#2a2a2a' }}>—</span>
            )}
          </div>
        </div>

        {/* Section Nav */}
        <nav aria-label="Page sections" style={{
          position: 'fixed',
          bottom: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 998,
          display: 'flex',
          alignItems: 'stretch',
          background: 'rgba(13,13,13,0.98)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(245, 242, 237, 0.34)',
          boxShadow: '0 10px 36px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(245, 242, 237, 0.06)',
          opacity: navVisible ? 1 : 0,
          pointerEvents: navVisible ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}>
          {navItems.map((item, i) => (
            <button
              key={item.id}
              onClick={() => {
                const el = document.getElementById(item.id)
                if (el) {
                  setActiveId(item.id)
                  scrollLocked.current = true
                  if (lockTimer.current) clearTimeout(lockTimer.current)
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  // Release lock after smooth scroll finishes (~600ms)
                  lockTimer.current = setTimeout(() => { scrollLocked.current = false }, 600)
                }
              }}
              className="font-mono"
              style={{
                fontSize: '11px',
                letterSpacing: '0.14em',
                color: activeId === item.id ? '#f5f2ed' : '#9a9a9a',
                padding: '11px 16px',
                background: activeId === item.id ? 'rgba(245, 242, 237, 0.08)' : 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                borderRight: i < navItems.length - 1 ? '1px solid rgba(245, 242, 237, 0.16)' : 'none',
                textShadow: activeId === item.id ? '0 0 10px rgba(245, 242, 237, 0.18)' : 'none',
                transition: 'color 0.15s ease, background 0.15s ease',
              }}
            >
              {item.label}
              {activeId === item.id && (
                <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#FF3120' }} />
              )}
            </button>
          ))}
        </nav>

      </main>
      <Footer />
    </>
  )
}
