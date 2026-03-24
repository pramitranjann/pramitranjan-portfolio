'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { RuleLabel } from './RuleLabel'
import { ReadingProgress } from './ReadingProgress'
import { playNav } from '@/lib/sounds'
import { GsapReveal } from './GsapReveal'

interface ProjectLink {
  slug: string
  title: string
}

interface CaseStudyLayoutProps {
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
  challengeImages?: [string, string]
  solutionHeroImage?: string
  solutionImages?: [string] | [string, string]
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

export function CaseStudyLayout({
  title, oneliner, type, tags, prev, next,
  backHref = '/work', backLabel = 'WORK',
  problem, role, research, challenge, process, usabilityTesting, solution, outcomes,
  problemHeadline, roleHeadline, researchHeadline, challengeHeadline,
  processHeadline, solutionHeadline, outcomesHeadline, pullQuote,
  heroImage, researchImage, challengeImages, solutionHeroImage, solutionImages,
}: CaseStudyLayoutProps) {
  const basePath = backHref

  const navItems = [
    { id: 'sec-problem',  label: 'PROBLEM_',   show: true },
    { id: 'sec-role',     label: 'MY ROLE_',   show: true },
    { id: 'sec-research', label: 'RESEARCH_',  show: !!research },
    { id: 'sec-challenge',label: 'CHALLENGE_', show: !!challenge },
    { id: 'sec-process',  label: 'PROCESS_',   show: !!(process || usabilityTesting) },
    { id: 'sec-solution', label: 'SOLUTION_',  show: true },
    { id: 'sec-outcomes', label: 'OUTCOMES_',  show: !!outcomes },
  ].filter(item => item.show)

  const [navVisible, setNavVisible] = useState(false)
  const [activeId, setActiveId]     = useState('')

  useEffect(() => {
    const getActiveSection = () => {
      const sections = Array.from(document.querySelectorAll('section[id^="sec-"]'))
        .filter(el => el.id !== 'sec-hero')
      // Pick the section with the most pixels visible in the top 60% of the viewport.
      // This handles short sections and works identically scrolling up or down.
      const band = window.innerHeight * 0.6
      let best: Element | null = null
      let bestPx = -1
      for (const el of sections) {
        const rect = el.getBoundingClientRect()
        const visTop = Math.max(rect.top, 65)   // below fixed nav
        const visBot = Math.min(rect.bottom, band)
        const px = Math.max(0, visBot - visTop)
        if (px > bestPx) { bestPx = px; best = el }
      }
      return best
    }

    const onScroll = () => {
      setNavVisible(window.scrollY > 100)
      const active = getActiveSection()
      if (active) setActiveId(active.id)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

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
            onClick={playNav}
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
          <div className="case-study-hero-image" style={{ position: 'relative', backgroundColor: '#161616', overflow: 'hidden' }}>
            {heroImage && <Image src={heroImage} alt={title} fill style={{ objectFit: 'contain' }} sizes="50vw" />}
          </div>
        </section>

        {/* Problem */}
        <section id="sec-problem" data-section="PROBLEM_" className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
              <span className="font-mono" style={labelStyle}>PROBLEM_</span>
              <div style={{ maxWidth: '640px' }}>
                {problemHeadline && (
                  <p className="font-mono" style={headlineStyle}>{problemHeadline}</p>
                )}
                <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8 }}>
                  {problem ?? 'This project focused on understanding user needs and translating them into a cohesive design solution. Through research, ideation, and iteration, the final product addresses real problems with intentional design decisions.'}
                </p>
              </div>
            </div>
          </GsapReveal>
        </section>

        {/* My Role */}
        <section id="sec-role" data-section="MY ROLE_" className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
              <span className="font-mono" style={labelStyle}>MY ROLE_</span>
              <div>
                {roleHeadline && (
                  <p className="font-mono" style={headlineStyle}>{roleHeadline}</p>
                )}
                <p className="case-study-body font-mono mb-6" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '640px' }}>
                  {role ?? 'Led end-to-end UX design including research planning, synthesis, interaction design, and high-fidelity prototyping.'}
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
          <section id="sec-research" data-section="RESEARCH_" className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
            <GsapReveal>
              <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
                <span className="font-mono" style={labelStyle}>RESEARCH_</span>
                <div style={{ maxWidth: '640px' }}>
                  {researchHeadline && (
                    <p className="font-mono" style={headlineStyle}>{researchHeadline}</p>
                  )}
                  <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8 }}>
                    {research}
                  </p>
                </div>
              </div>
              {researchImage && (
                <div data-reveal className="case-study-research-image w-full mt-6" style={{ position: 'relative', height: '320px', backgroundColor: '#161616', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                  <Image src={researchImage} alt="Research" fill style={{ objectFit: 'contain' }} sizes="100vw" />
                </div>
              )}
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
              KEY INSIGHT_
            </p>
          </div>
        )}

        {/* Challenge */}
        {challenge && (
          <section id="sec-challenge" data-section="CHALLENGE_" className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
            <GsapReveal>
              <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
                <span className="font-mono" style={labelStyle}>CHALLENGE_</span>
                <div style={{ maxWidth: '640px' }}>
                  {challengeHeadline && (
                    <p className="font-mono" style={headlineStyle}>{challengeHeadline}</p>
                  )}
                  <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8 }}>
                    {challenge}
                  </p>
                </div>
              </div>
              {challengeImages && (
                <div data-reveal className="case-study-image-grid mt-6 grid grid-cols-2" style={{ gap: '2px' }}>
                  <div className="case-study-ideation-image" style={{ position: 'relative', height: '267px', backgroundColor: '#161616', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                    <Image src={challengeImages[0]} alt="Challenge 1" fill style={{ objectFit: 'contain' }} sizes="50vw" />
                  </div>
                  <div className="case-study-ideation-image" style={{ position: 'relative', height: '267px', backgroundColor: '#161616', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                    <Image src={challengeImages[1]} alt="Challenge 2" fill style={{ objectFit: 'contain' }} sizes="50vw" />
                  </div>
                </div>
              )}
            </GsapReveal>
          </section>
        )}

        {/* Process */}
        {(process || usabilityTesting) && (
          <section id="sec-process" data-section="PROCESS_" className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
            <GsapReveal>
              <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
                <span className="font-mono" style={labelStyle}>PROCESS_</span>
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
        <section id="sec-solution" data-section="SOLUTION_" className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
              <span className="font-mono" style={labelStyle}>SOLUTION_</span>
              <div style={{ maxWidth: '640px' }}>
                {solutionHeadline && (
                  <p className="font-mono" style={headlineStyle}>{solutionHeadline}</p>
                )}
                <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8 }}>
                  {solution ?? ''}
                </p>
              </div>
            </div>
            {solutionHeroImage && (
              <div data-reveal className="case-study-solution-hero w-full mt-6 mb-1" style={{ position: 'relative', height: '480px', backgroundColor: '#161616', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                <Image src={solutionHeroImage} alt="Solution" fill style={{ objectFit: 'contain' }} sizes="100vw" />
              </div>
            )}
            {solutionImages && (solutionImages[0] || solutionImages[1]) && (
              <div data-reveal className="case-study-image-grid grid grid-cols-2" style={{ gap: '2px' }}>
                <div className="case-study-solution-image" style={{ position: 'relative', height: '320px', backgroundColor: '#161616', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                  {solutionImages[0] && <Image src={solutionImages[0]} alt="Solution 1" fill style={{ objectFit: 'contain' }} sizes="50vw" />}
                </div>
                <div className="case-study-solution-image" style={{ position: 'relative', height: '320px', backgroundColor: '#161616', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                  {solutionImages[1] && <Image src={solutionImages[1]} alt="Solution 2" fill style={{ objectFit: 'contain' }} sizes="50vw" />}
                </div>
              </div>
            )}
          </GsapReveal>
        </section>

        {/* Outcomes */}
        {outcomes && (
          <section id="sec-outcomes" data-section="OUTCOMES_" className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
            <GsapReveal>
              <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
                <span className="font-mono" style={labelStyle}>OUTCOMES_</span>
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
              <Link href={`${basePath}/${prev.slug}`} className="block" onClick={playNav}>
                <p className="font-mono mb-2" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.12em', color: '#FF3120' }}>
                  <span className="arrow-nudge-back">←</span> PREV
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
              <Link href={`${basePath}/${next.slug}`} className="block" onClick={playNav}>
                <p className="font-mono mb-2" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.12em', color: '#FF3120' }}>
                  NEXT <span className="arrow-nudge">→</span>
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
          background: 'rgba(17,17,17,0.96)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #222',
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
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className="font-mono"
              style={{
                fontSize: '10px',
                letterSpacing: '0.14em',
                color: activeId === item.id ? '#f5f2ed' : '#3a3a3a',
                padding: '11px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                borderRight: i < navItems.length - 1 ? '1px solid #1a1a1a' : 'none',
                transition: 'color 0.15s ease',
              }}
            >
              {item.label}
              {activeId === item.id && (
                <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: '#FF3120' }} />
              )}
            </button>
          ))}
        </nav>

      </main>
      <Footer />
    </>
  )
}
