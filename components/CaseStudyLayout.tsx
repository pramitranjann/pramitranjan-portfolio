'use client'
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
  heroImage?: string
  researchImage?: string
  challengeImages?: [string, string]
  solutionHeroImage?: string
  solutionImages?: [string] | [string, string]
}

// Shared label style — serif italic callout
const labelStyle: React.CSSProperties = {
  fontSize: 'var(--text-h3)',
  fontWeight: 400,
  fontStyle: 'italic',
  color: '#666666',
  lineHeight: 1,
  paddingTop: '4px',
}

export function CaseStudyLayout({
  title, oneliner, type, tags, prev, next,
  backHref = '/work', backLabel = 'WORK',
  problem, role, research, challenge, process, usabilityTesting, solution, outcomes,
  heroImage, researchImage, challengeImages, solutionHeroImage, solutionImages,
}: CaseStudyLayoutProps) {
  const basePath = backHref
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
        <section className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
              <span className="font-serif" style={labelStyle}>Problem</span>
              <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '66%' }}>
                {problem ?? 'This project focused on understanding user needs and translating them into a cohesive design solution. Through research, ideation, and iteration, the final product addresses real problems with intentional design decisions.'}
              </p>
            </div>
          </GsapReveal>
        </section>

        {/* My Role */}
        <section className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
              <span className="font-serif" style={labelStyle}>My Role</span>
              <div>
                <p className="case-study-body font-mono mb-6" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '66%' }}>
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
          <section className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
            <GsapReveal>
              <div data-reveal className="case-study-meta-grid grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
                <span className="font-serif" style={labelStyle}>Research</span>
                <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '66%' }}>
                  {research}
                </p>
              </div>
              {researchImage && (
                <div data-reveal className="case-study-research-image w-full mt-6" style={{ position: 'relative', height: '320px', backgroundColor: '#161616', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                  <Image src={researchImage} alt="Research" fill style={{ objectFit: 'contain' }} sizes="100vw" />
                </div>
              )}
            </GsapReveal>
          </section>
        )}

        {/* Challenge */}
        {challenge && (
          <section className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
            <GsapReveal>
              <div data-reveal className="case-study-meta-grid grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
                <span className="font-serif" style={labelStyle}>Challenge</span>
                <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '66%' }}>
                  {challenge}
                </p>
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
          <section className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
            <GsapReveal>
              <div data-reveal className="case-study-meta-grid grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
                <span className="font-serif" style={labelStyle}>Process</span>
                <div>
                  {process && (
                    <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '66%' }}>
                      {process}
                    </p>
                  )}
                  {usabilityTesting && (
                    <p className="case-study-body font-mono mt-6" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '66%' }}>
                      {usabilityTesting}
                    </p>
                  )}
                </div>
              </div>
            </GsapReveal>
          </section>
        )}

        {/* Solution */}
        <section className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
          <GsapReveal>
            <div data-reveal className="case-study-meta-grid grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
              <span className="font-serif" style={labelStyle}>Solution</span>
              <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '66%' }}>
                {solution ?? ''}
              </p>
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
          <section className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
            <GsapReveal>
              <div data-reveal className="case-study-meta-grid grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
                <span className="font-serif" style={labelStyle}>Outcomes</span>
                <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '66%' }}>
                  {outcomes}
                </p>
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

      </main>
      <Footer />
    </>
  )
}
