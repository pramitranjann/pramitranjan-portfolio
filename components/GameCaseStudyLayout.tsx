'use client'

import { useEffect, useState } from 'react'
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
  /*
  USER-CONTROLLED STAGE SYSTEM

  intro:
  - user sees the game description
  - nothing moves automatically

  loading:
  - starts only after user clicks ENTER NOW
  - progress bar / loading cue plays

  play:
  - embed appears after loading finishes
*/
const [stage, setStage] = useState<'intro' | 'loading' | 'play'>('intro')
const [isMobileViewport, setIsMobileViewport] = useState(false)

useEffect(() => {
  const mediaQuery = window.matchMedia('(max-width: 767px)')
  const syncViewport = () => setIsMobileViewport(mediaQuery.matches)

  syncViewport()
  mediaQuery.addEventListener('change', syncViewport)

  return () => {
    mediaQuery.removeEventListener('change', syncViewport)
  }
}, [])

const showPlayStage = !isMobileViewport && stage === 'play'
const isLoadingStage = stage === 'loading'

function enterGame() {
  if (isMobileViewport) {
    if (embedUrl) {
      window.open(embedUrl, '_blank', 'noopener,noreferrer')
    }
    return
  }

  if (stage !== 'intro') return

  setStage('loading')

  window.setTimeout(() => {
    setStage('play')
  }, 2400)
}

  const embedUrl = project.solutionEmbedUrl
  const embedTitle = project.solutionEmbedTitle ?? `${project.title} live game`

  /*
    EMBED SHAPE

    This controls the shape of the game frame.

    16 / 9  = standard wide game frame
    16 / 10 = slightly taller
    4 / 3   = older game/window feel

    You can also override this per game in your content with:
    solutionEmbedAspectRatio: '16 / 9'
  */
  const aspectRatio = project.solutionEmbedAspectRatio ?? '16 / 10'

  const backHref = project.backHref ?? '/play'
  const backLabel = project.backLabel ?? 'PLAY'
  const embedSupportNote = isMobileViewport
    ? 'Phone preview only. Open the full game to play it properly.'
    : (project.solutionEmbedCalloutBody ??
      'Best experienced on desktop. Open fullscreen if the embed feels cramped.')

  return (
    <>
      <ReadingProgress />
      <Nav />

      <main style={{ paddingTop: '57px' }}>
        {/* 
          TOP BAR / BACK LINK

          This always stays at the top.
          It keeps the page consistent with your normal case study pages.
        */}
        <div
          className="case-study-back"
          style={{
            padding: '24px var(--layout-page-gutter) 0',
          }}
        >
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

                {/* 
          STAGED INTRO

          This section exists during the intro and loading stages.

          Stage behavior:
          - intro: user sees description + ENTER NOW button
          - loading: progress bar plays after user clicks ENTER NOW
          - play: this entire section disappears, so the embed can move up

          Important:
          The preview panel is separate from the left description column.
          Do not place the preview panel inside the left text div.
        */}
        {stage !== 'play' || isMobileViewport ? (
          <section
            className="border-b border-divider game-intro-section"
            style={{
              minHeight: isMobileViewport ? 'auto' : 'calc(100vh - 220px)',
              padding: '64px var(--layout-page-gutter) 72px',
              overflow: 'hidden',
            }}
          >
            <div
              className="game-intro-stage-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(360px, 680px) minmax(420px, 1fr)',
                gap: '56px',
                alignItems: 'center',
              }}
            >
              {/* 
                LEFT COLUMN
                This is the intro content:
                game type, title, description, tags, and ENTER NOW/loading state.
              */}
              <div style={{ maxWidth: '820px' }}>
                <RuleLabel number={project.type || 'GAME'} />

                <h1
                  className="font-serif"
                  style={{
                    fontSize: 'var(--text-h1)',
                    fontWeight: 'var(--font-weight-serif)',
                    color: 'var(--color-heading)',
                    lineHeight: 1.05,
                    marginTop: '14px',
                    marginBottom: 0,
                  }}
                >
                  {project.title}
                </h1>

                <p
                  className="font-mono"
                  style={{
                    fontSize: 'var(--text-body-lg)',
                    letterSpacing: '0.03em',
                    color: 'var(--color-heading)',
                    lineHeight: 1.55,
                    maxWidth: '780px',
                    marginTop: '18px',
                    marginBottom: 0,
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
                      lineHeight: 1.65,
                      maxWidth: '780px',
                      marginTop: '12px',
                      marginBottom: 0,
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
                    marginTop: '16px',
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

                {embedUrl && !isMobileViewport ? (
                  <div
                    className="game-intro-inline-actions"
                    style={{
                      gap: '12px',
                      marginTop: '24px',
                    }}
                  >
                    <button
                      type="button"
                      onPointerDown={playNav}
                      onClick={enterGame}
                      disabled={isLoadingStage}
                      className="font-mono"
                      style={{
                        border: '1px solid var(--color-red)',
                        background: isLoadingStage ? '#161616' : 'transparent',
                        color: 'var(--color-red)',
                        padding: '12px 16px',
                        letterSpacing: '0.14em',
                        fontSize: 'var(--text-meta)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        cursor: isLoadingStage ? 'default' : 'pointer',
                      }}
                    >
                      <span>{isLoadingStage ? 'PREPARING EMBED' : 'ENTER NOW'}</span>
                      <span className="arrow-nudge">→</span>
                    </button>

                    <a
                      href={embedUrl}
                      target="_blank"
                      rel="noreferrer"
                      onPointerDown={playNav}
                      className="font-mono"
                      style={{
                        border: '1px solid #2a2a2a',
                        color: 'var(--color-heading)',
                        padding: '12px 16px',
                        letterSpacing: '0.14em',
                        fontSize: 'var(--text-meta)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        textDecoration: 'none',
                      }}
                    >
                      <span>{project.solutionEmbedCtaLabel ?? 'OPEN FULLSCREEN'}</span>
                      <span className="arrow-nudge">↗</span>
                    </a>
                  </div>
                ) : null}
              </div>

              {/* 
  RIGHT COLUMN / REAL EMBED PREVIEW

  This uses the actual Vercel iframe as the preview,
  but places a button overlay on top so the user cannot interact with it yet.

  User flow:
  - user sees the real game preview
  - overlay says CLICK TO PLAY
  - clicking overlay starts the loading stage
  - after loading, the full play-stage embed appears
*/}
<div className="game-intro-preview">
  <div
    style={{
      border: '1px solid #1f1f1f',
      background: '#111111',
      padding: '12px',
      boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
    }}
  >
    {/* PREVIEW TOP BAR */}
    <div
      style={{
        height: '32px',
        borderBottom: '1px solid #1f1f1f',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 4px 10px',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: 999,
          background: '#FF3120',
          opacity: 0.7,
        }}
      />
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: 999,
          background: '#444444',
        }}
      />
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: 999,
          background: '#444444',
        }}
      />

      <span
        className="font-mono"
        style={{
          marginLeft: '10px',
          fontSize: 'var(--text-meta)',
          letterSpacing: '0.12em',
          color: '#666666',
        }}
      >
        {isLoadingStage ? 'LOADING BUILD_' : (isMobileViewport ? 'PHONE PREVIEW_' : 'LIVE PREVIEW_')}
      </span>
    </div>

    {/* 
      REAL EMBED PREVIEW AREA

      The iframe is visible, but the overlay button blocks interaction.
    */}
    <div
      style={{
        marginTop: '12px',
        position: 'relative',
        aspectRatio,
        border: '1px solid #1a1a1a',
        background: '#0d0d0d',
        overflow: 'hidden',
      }}
    >
{project.useEmbedPreview && embedUrl ? (
  <iframe
    src={embedUrl}
    title={`${embedTitle} preview`}
    loading="lazy"
    referrerPolicy="strict-origin-when-cross-origin"
    allow="camera; microphone; fullscreen; autoplay"
    allowFullScreen
    style={{
      width: '100%',
      height: '100%',
      border: 0,
      background: '#0d0d0d',

      /*
        This keeps the preview visible but prevents users from playing
        before they intentionally click the overlay.
      */
      pointerEvents: 'none',
    }}
  />
) : project.heroImage ? (
  <img
    src={project.heroImage}
    alt={`${project.title} preview`}
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center center',
      opacity: isLoadingStage ? 0.35 : 0.9,
      transition: 'opacity 240ms ease',
    }}
  />
) : (
  <div
    className="font-mono"
    style={{
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      color: '#444444',
      fontSize: 'var(--text-meta)',
      letterSpacing: '0.16em',
      background:
        'linear-gradient(135deg, rgba(255,49,32,0.08), rgba(255,255,255,0.02)), #0d0d0d',
    }}
  >
    {embedUrl ? 'LIVE BUILD READY' : 'LIVE BUILD URL PENDING'}
  </div>
)}

      {/* 
        CLICK OVERLAY

        This blocks interaction with the preview iframe.
        Clicking it starts the loading animation.
      */}
      <button
        type="button"
        onPointerDown={playNav}
        onClick={enterGame}
        disabled={isLoadingStage || !embedUrl}
        className="font-mono"
        style={{
          position: 'absolute',
          inset: 0,
          border: 'none',
          cursor: isLoadingStage || !embedUrl ? 'default' : 'pointer',
          background: isLoadingStage
            ? 'rgba(0,0,0,0.72)'
            : 'linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.2), rgba(0,0,0,0.06))',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '18px',
          color: 'var(--color-red)',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-meta)',
            letterSpacing: '0.14em',
          }}
        >
          {isLoadingStage ? 'PREPARING EMBED' : (isMobileViewport ? 'OPEN FULL GAME' : 'CLICK TO PLAY')}
        </span>

        <span
          className="arrow-nudge"
          style={{
            fontSize: 'var(--text-meta)',
            letterSpacing: '0.14em',
          }}
        >
          {isMobileViewport ? '↗' : '→'}
        </span>
      </button>
    </div>

    {isMobileViewport ? (
      <p
        className="font-mono"
        style={{
          marginTop: '12px',
          marginBottom: 0,
          fontSize: 'var(--text-meta)',
          letterSpacing: '0.04em',
          color: 'var(--color-body)',
          lineHeight: 1.55,
        }}
      >
        {embedSupportNote}
      </p>
    ) : null}
  </div>
</div>
            </div>
          </section>
        ) : null}
        {/* 
  PLAY STAGE / LIVE GAME AREA

  This appears after the intro delay.
  It keeps the game title visible after the intro disappears,
  then makes the embed the main focus.
*/}
<section
  className="border-b border-divider"
  style={{
    padding: showPlayStage
      ? '16px var(--layout-page-gutter) 36px'
      : '0 var(--layout-page-gutter) 0',
    opacity: showPlayStage ? 1 : 0,
    transform: showPlayStage ? 'translateY(0)' : 'translateY(18px)',
    pointerEvents: showPlayStage ? 'auto' : 'none',
    maxHeight: showPlayStage ? '1200px' : 0,
    overflow: 'hidden',
    transition:
      'opacity 700ms cubic-bezier(0.23, 1, 0.32, 1), transform 700ms cubic-bezier(0.23, 1, 0.32, 1), max-height 800ms cubic-bezier(0.23, 1, 0.32, 1), padding 700ms cubic-bezier(0.23, 1, 0.32, 1)',
  }}
>
  <div
    style={{
      width: '100%',
      display: 'grid',
      gap: '14px',
    }}
  >
    {/* 
      PLAY STAGE HEADER

      This keeps the game identity visible after the intro disappears.

      Left side:
      - game title
      - LIVE GAME label
      - short note

      Right side:
      - Open Fullscreen button that still goes to the Vercel site
    */}
    <div
      className="game-play-stage-header"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '18px',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '8px',
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          <h1
            className="font-serif"
            style={{
              fontSize: 'clamp(28px, 3vw, 42px)',
              fontWeight: 'var(--font-weight-serif)',
              color: 'var(--color-heading)',
              lineHeight: 1,
              margin: 0,
            }}
          >
            {project.title}
          </h1>

          <span
            className="font-mono"
            style={{
              fontSize: 'var(--text-eyebrow)',
              letterSpacing: '0.16em',
              color: 'var(--color-red)',
              whiteSpace: 'nowrap',
            }}
          >
            {project.solutionEmbedCalloutLabel ?? 'LIVE GAME_'}
          </span>
        </div>

        <p
          className="font-mono game-play-stage-note"
          style={{
            fontSize: 'var(--text-meta)',
            letterSpacing: '0.04em',
            color: 'var(--color-body)',
            lineHeight: 1.5,
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {embedSupportNote}
        </p>
      </div>

      {embedUrl ? (
        <a
          href={embedUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono game-play-stage-cta"
          onPointerDown={playNav}
          style={{
            fontSize: 'var(--text-meta)',
            letterSpacing: '0.14em',
            color: 'var(--color-red)',
            border: '1px solid var(--color-red)',
            padding: '10px 18px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {project.solutionEmbedCtaLabel ?? 'OPEN FULLSCREEN'}{' '}
          <span className="arrow-nudge">↗</span>
        </a>
      ) : null}
    </div>

    {/* 
      GAME FRAME

      This is the embedded Vercel game.

      If the ratio does not match fullscreen, change:
      solutionEmbedAspectRatio in your game content.
    */}
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
        {/* 
          REFLECTION

          This appears after the play stage.
          It stays hidden until the embed has appeared,
          so the first moment of the page remains focused.
        */}
        {project.outcomes ? (
          <section
            className="border-b border-divider"
            style={{
              padding: showPlayStage
                ? '28px var(--layout-page-gutter)'
                : '0 var(--layout-page-gutter)',
              opacity: showPlayStage ? 1 : 0,
              pointerEvents: showPlayStage ? 'auto' : 'none',
              maxHeight: showPlayStage ? '500px' : 0,
              overflow: 'hidden',
              transition:
                'opacity 700ms ease 180ms, max-height 800ms cubic-bezier(0.23, 1, 0.32, 1), padding 700ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          >
            <div
              className="case-study-meta-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '0.8fr 1.4fr',
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
                  lineHeight: 1.7,
                  maxWidth: '760px',
                  margin: 0,
                }}
              >
                {project.outcomes}
              </p>
            </div>
          </section>
        ) : null}

        {/* 
          PREV / NEXT

          Lets users move between the game pages.
          This also stays hidden until the play stage begins.
        */}
        <div
          className="grid grid-cols-2 border-b border-divider"
          style={{
            opacity: showPlayStage ? 1 : 0,
            pointerEvents: showPlayStage ? 'auto' : 'none',
            maxHeight: showPlayStage ? '200px' : 0,
            overflow: 'hidden',
            transition: 'opacity 700ms ease 250ms, max-height 700ms ease',
          }}
        >
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
                style={{
                  fontSize: 'var(--text-eyebrow)',
                  color: '#2a2a2a',
                }}
              >
                —
              </span>
            )}
          </div>

          <div
            className="case-study-prev-next text-right"
            style={{ padding: '28px 40px' }}
          >
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
                style={{
                  fontSize: 'var(--text-eyebrow)',
                  color: '#2a2a2a',
                }}
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
