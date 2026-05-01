'use client'

import Link from 'next/link'
import { Footer } from './Footer'
import { Nav } from './Nav'
import { ReadingProgress } from './ReadingProgress'
import { RuleLabel } from './RuleLabel'
import { playNav } from '@/lib/sounds'
import type { CaseStudyContent } from '@/lib/site-content-schema'

interface GameCaseStudyLayoutProps {
  project: CaseStudyContent
}

export function GameCaseStudyLayout({ project }: GameCaseStudyLayoutProps) {
  const embedUrl = project.solutionEmbedUrl
  const embedTitle = project.solutionEmbedTitle ?? `${project.title} live game`
  const aspectRatio = project.solutionEmbedAspectRatio ?? '16 / 9'
  const embedWidth = project.solutionEmbedWidth ?? 'min(100%, 1180px)'
  const backHref = project.backHref ?? '/play'
  const backLabel = project.backLabel ?? 'PLAY'

  return (
    <>
      <ReadingProgress />
      <Nav />

      <main style={{ paddingTop: '57px' }}>
        <div className="case-study-back" style={{ padding: '24px var(--layout-page-gutter) 0' }}>
          <Link
            href={backHref}
            className="font-mono"
            onPointerDown={playNav}
            style={{
              fontSize: 'var(--text-meta)',
              letterSpacing: '0.12em',
              color: 'var(--back-link-color)',
              textDecoration: 'none',
            }}
          >
            <span className="arrow-nudge-back">←</span> {backLabel}
          </Link>
        </div>

        <section
          className="border-b border-divider"
          style={{ padding: '56px var(--layout-page-gutter) 40px' }}
        >
          <div
            className="game-case-study-hero"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.4fr',
              gap: '48px',
              alignItems: 'end',
            }}
          >
            <div>
              <RuleLabel number={project.type || 'GAME'} />

              <h1
                className="font-serif"
                style={{
                  fontSize: 'var(--text-h1)',
                  fontWeight: 'var(--font-weight-serif)',
                  color: 'var(--color-heading)',
                  lineHeight: 1.05,
                  marginTop: '14px',
                }}
              >
                {project.title}
              </h1>
            </div>

            <div>
              <p
                className="font-mono"
                style={{
                  fontSize: 'var(--text-body-lg)',
                  letterSpacing: '0.03em',
                  color: 'var(--color-heading)',
                  lineHeight: 1.65,
                  maxWidth: '760px',
                }}
              >
                {project.oneliner}
              </p>

              {project.solution ? (
                <p
                  className="font-mono"
                  style={{
                    fontSize: 'var(--text-body)',
                    letterSpacing: '0.04em',
                    color: 'var(--color-body)',
                    lineHeight: 1.8,
                    maxWidth: '760px',
                    marginTop: '18px',
                  }}
                >
                  {project.solution}
                </p>
              ) : null}

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '22px',
                }}
              >
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono"
                    style={{
                      fontSize: 'var(--text-eyebrow)',
                      letterSpacing: '0.12em',
                      color: 'var(--color-label)',
                      border: '1px solid #1f1f1f',
                      padding: '5px 10px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className="border-b border-divider"
          style={{ padding: '40px var(--layout-page-gutter)' }}
        >
          <div
            style={{
              width: embedWidth,
              margin: '0 auto',
              display: 'grid',
              gap: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '18px',
                alignItems: 'end',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 'var(--text-eyebrow)',
                    letterSpacing: '0.16em',
                    color: 'var(--color-red)',
                  }}
                >
                  {project.solutionEmbedCalloutLabel ?? 'PLAYABLE BUILD'}
                </span>

                <p
                  className="font-mono"
                  style={{
                    fontSize: 'var(--text-body-lg)',
                    letterSpacing: '0.01em',
                    color: 'var(--color-heading)',
                    lineHeight: 1.5,
                    marginTop: '10px',
                    marginBottom: 0,
                  }}
                >
                  {project.solutionEmbedCalloutTitle ?? 'Play the live game.'}
                </p>
              </div>

              {embedUrl ? (
                <a
                  href={embedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono"
                  onPointerDown={playNav}
                  style={{
                    fontSize: 'var(--text-meta)',
                    letterSpacing: '0.14em',
                    color: 'var(--color-red)',
                    border: '1px solid var(--color-red)',
                    padding: '10px 18px',
                    textDecoration: 'none',
                  }}
                >
                  {project.solutionEmbedCtaLabel ?? 'OPEN FULLSCREEN'}{' '}
                  <span className="arrow-nudge">↗</span>
                </a>
              ) : null}
            </div>

            {project.solutionEmbedCalloutBody ? (
              <p
                className="font-mono"
                style={{
                  fontSize: 'var(--text-body)',
                  letterSpacing: '0.04em',
                  color: 'var(--color-body)',
                  lineHeight: 1.75,
                  maxWidth: '720px',
                  margin: 0,
                }}
              >
                {project.solutionEmbedCalloutBody}
              </p>
            ) : null}

            {embedUrl ? (
              <div
                style={{
                  background: '#111111',
                  border: '1px solid #1f1f1f',
                  padding: '12px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio,
                    background: '#0d0d0d',
                    border: '1px solid #1a1a1a',
                    overflow: 'hidden',
                  }}
                >
                  <iframe
                    src={embedUrl}
                    title={embedTitle}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="camera; microphone; fullscreen; autoplay"
                    allowFullScreen
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 0,
                      background: '#0d0d0d',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div
                className="font-mono"
                style={{
                  border: '1px solid #1f1f1f',
                  background: '#111111',
                  padding: '24px',
                  color: 'var(--color-body)',
                  letterSpacing: '0.04em',
                  lineHeight: 1.75,
                }}
              >
                Live build URL pending.
              </div>
            )}
          </div>
        </section>

        {project.outcomes ? (
          <section
            className="border-b border-divider"
            style={{ padding: '32px var(--layout-page-gutter)' }}
          >
            <div
              className="case-study-meta-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: '48px',
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: 'var(--text-eyebrow)',
                  color: 'var(--color-red)',
                  letterSpacing: '0.16em',
                  lineHeight: 1,
                }}
              >
                REFLECTION
              </span>

              <p
                className="case-study-body font-mono"
                style={{
                  fontSize: 'var(--text-body)',
                  letterSpacing: '0.04em',
                  color: 'var(--color-body)',
                  lineHeight: 1.8,
                  maxWidth: '720px',
                  margin: 0,
                }}
              >
                {project.outcomes}
              </p>
            </div>
          </section>
        ) : null}

        <div className="grid grid-cols-2 border-b border-divider">
          <div
            className="case-study-prev-next border-r border-divider"
            style={{ padding: '28px 40px' }}
          >
            {project.prev ? (
              <Link
                href={`${backHref}/${project.prev.slug}`}
                className="block"
                onPointerDown={playNav}
                style={{ textDecoration: 'none' }}
              >
                <p
                  className="font-mono mb-2"
                  style={{
                    fontSize: 'var(--text-eyebrow)',
                    letterSpacing: '0.12em',
                    color: 'var(--color-red)',
                  }}
                >
                  <span className="arrow-nudge-back">←</span> PREV
                </p>

                <p
                  className="font-serif"
                  style={{
                    fontSize: 'var(--text-body)',
                    fontWeight: 'var(--font-weight-serif)',
                    color: '#666666',
                    margin: 0,
                  }}
                >
                  {project.prev.title}
                </p>
              </Link>
            ) : (
              <span
                className="font-mono"
                style={{ fontSize: 'var(--text-eyebrow)', color: '#2a2a2a' }}
              >
                —
              </span>
            )}
          </div>

          <div className="case-study-prev-next text-right" style={{ padding: '28px 40px' }}>
            {project.next ? (
              <Link
                href={`${backHref}/${project.next.slug}`}
                className="block"
                onPointerDown={playNav}
                style={{ textDecoration: 'none' }}
              >
                <p
                  className="font-mono mb-2"
                  style={{
                    fontSize: 'var(--text-eyebrow)',
                    letterSpacing: '0.12em',
                    color: 'var(--color-red)',
                  }}
                >
                  NEXT <span className="arrow-nudge">→</span>
                </p>

                <p
                  className="font-serif"
                  style={{
                    fontSize: 'var(--text-body)',
                    fontWeight: 'var(--font-weight-serif)',
                    color: '#666666',
                    margin: 0,
                  }}
                >
                  {project.next.title}
                </p>
              </Link>
            ) : (
              <span
                className="font-mono"
                style={{ fontSize: 'var(--text-eyebrow)', color: '#2a2a2a' }}
              >
                —
              </span>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
