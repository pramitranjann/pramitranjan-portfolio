import Image from 'next/image'
import Link from 'next/link'
import { EditorialEmbed } from '@/components/EditorialEmbed'
import { EditorialMediaVideo } from '@/components/EditorialMediaVideo'
import { EditorialVideoCarousel } from '@/components/EditorialVideoCarousel'
import { Footer } from '@/components/Footer'
import { CaseStudyNav } from '@/components/CaseStudyNav'
import { FranklinsRedesignGallery } from '@/components/FranklinsRedesignGallery'
import { Nav } from '@/components/Nav'
import type { CaseStudyContent, EditorialMediaItem } from '@/lib/site-content-schema'

type EditorialCaseStudyProps = Pick<
  CaseStudyContent,
  | 'title'
  | 'oneliner'
  | 'type'
  | 'tags'
  | 'next'
  | 'problemHeadline'
  | 'roleHeadline'
  | 'researchHeadline'
  | 'challengeHeadline'
  | 'processHeadline'
  | 'solutionHeadline'
  | 'outcomesHeadline'
  | 'pullQuote'
  | 'heroImage'
  | 'researchKicker'
  | 'processKicker'
  | 'solutionKicker'
  | 'researchBriefTitle'
  | 'researchBriefBody'
  | 'researchBriefItems'
  | 'decisionBriefTitle'
  | 'decisionBriefBody'
  | 'decisionBriefItems'
  | 'researchArtifact'
  | 'researchArtifactAlt'
  | 'decisionArtifact'
  | 'decisionArtifactAlt'
  | 'processArtifact'
  | 'processArtifactAlt'
  | 'editorialMedia'
  | 'solutionEmbedUrl'
  | 'solutionEmbedTitle'
  | 'solutionEmbedAspectRatio'
  | 'solutionEmbedCtaLabel'
> & {
  /* the Swipey hub renders this inside a modal that already has page chrome */
  chrome?: boolean
  /* FranklinsRedesignGallery hardcodes Franklin's screens — opt in, never inherit */
  gallery?: boolean
  backHref?: string
  backLabel?: string
}

function Artifact({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <figure className="editorial-artifact">
      <Image src={src} alt={alt} fill priority={priority} sizes="(max-width: 900px) 100vw, 1120px" />
    </figure>
  )
}

function EditorialMedia({ items }: { items?: EditorialMediaItem[] }) {
  const visibleItems = items?.filter((item) => item.src) ?? []
  if (!visibleItems.length) return null

  const carouselItems = visibleItems.filter(
    (item): item is EditorialMediaItem & { src: string; carouselLabel: string } =>
      item.kind === 'video' && Boolean(item.src && item.carouselLabel),
  )

  if (carouselItems.length > 1 && carouselItems.length === visibleItems.length) {
    return (
      <div className="editorial-shell editorial-artifact-wrap editorial-story-media-list">
        <EditorialVideoCarousel items={carouselItems} />
      </div>
    )
  }

  return (
    <div className="editorial-shell editorial-artifact-wrap editorial-story-media-list">
      {visibleItems.map((item) => (
        <figure
          key={item.id}
          className={`editorial-story-media${item.kind === 'video' ? ' editorial-story-media-video' : ' editorial-story-media-image'}${item.frame ? ' editorial-story-media-framed' : ''}`}
          style={{
            aspectRatio: item.aspectRatio ?? '16 / 9',
            background: item.background ?? '#080808',
          }}
        >
          {item.kind === 'video' ? (
            <EditorialMediaVideo
              src={item.src!}
              poster={item.poster}
              alt={item.alt}
              fit={item.fit}
            />
          ) : (
            <span className="editorial-story-media-image-content">
              <Image
                src={item.src!}
                alt={item.alt ?? ''}
                fill
                sizes="(max-width: 900px) 100vw, 1120px"
                style={{ objectFit: item.fit ?? 'cover' }}
              />
            </span>
          )}
          {item.caption ? <figcaption className="font-mono editorial-story-media-caption">{item.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  )
}

/* A kicker + statement pair, optionally followed by an explainer block and an artifact.
   Every part is optional, so a case study renders only the pieces it has copy for. */
function Chapter({
  id,
  section,
  className,
  kicker,
  statement,
  briefTitle,
  briefBody,
  briefItems,
  listClassName,
  briefClassName,
  artifact,
  artifactAlt,
  media,
  afterMedia,
  children,
}: {
  id?: string
  section?: string
  className: string
  kicker?: string
  statement?: string
  briefTitle?: string
  briefBody?: string
  briefItems?: string[]
  listClassName?: string
  briefClassName?: string
  artifact?: string
  artifactAlt?: string
  media?: EditorialMediaItem[]
  afterMedia?: React.ReactNode
  children?: React.ReactNode
}) {
  if (!statement) return null
  const hasBrief = Boolean(briefTitle || briefBody || briefItems?.length)

  return (
    <section id={id} className={`editorial-section ${className}`} data-section={section}>
      <div className="editorial-shell editorial-narrow">
        {kicker ? <p className="font-mono editorial-kicker">{kicker}</p> : null}
        <h2 className="font-reading editorial-statement">{statement}</h2>
        {children}
      </div>

      {hasBrief ? (
        <div className={`editorial-shell editorial-explainer-wrap ${briefClassName ?? ''}`}>
          <div>
            {briefTitle ? <p className="font-reading editorial-brief-title">{briefTitle}</p> : null}
            {briefBody ? <p className="font-reading editorial-brief-copy">{briefBody}</p> : null}
          </div>
          {briefItems?.length ? (
            <ul className={`font-mono ${listClassName ?? 'editorial-question-list'}`}>
              {briefItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          ) : null}
        </div>
      ) : null}

      {artifact ? (
        <div className="editorial-shell editorial-artifact-wrap">
          <Artifact src={artifact} alt={artifactAlt ?? ''} />
        </div>
      ) : null}
      <EditorialMedia items={media} />
      {afterMedia ? (
        <div className="editorial-shell editorial-live-action-wrap">
          {afterMedia}
        </div>
      ) : null}
    </section>
  )
}

export function EditorialCaseStudy({
  title,
  oneliner,
  type,
  tags,
  next,
  problemHeadline,
  roleHeadline,
  researchHeadline,
  challengeHeadline,
  processHeadline,
  solutionHeadline,
  outcomesHeadline,
  pullQuote,
  heroImage,
  researchKicker,
  processKicker,
  solutionKicker = 'WHAT SHIPPED',
  researchBriefTitle,
  researchBriefBody,
  researchBriefItems,
  decisionBriefTitle,
  decisionBriefBody,
  decisionBriefItems,
  researchArtifact,
  researchArtifactAlt,
  decisionArtifact,
  decisionArtifactAlt,
  processArtifact,
  processArtifactAlt,
  editorialMedia,
  solutionEmbedUrl,
  solutionEmbedTitle = 'Live experience',
  solutionEmbedAspectRatio = '4 / 3',
  solutionEmbedCtaLabel = 'OPEN LIVE APP',
  chrome = true,
  gallery = false,
  backHref = '/work',
  backLabel = 'WORK',
}: EditorialCaseStudyProps) {
  // A deployed app lays itself out to whatever viewport the iframe hands it, so
  // a width-derived ratio goes short on narrow screens and clips the app. The
  // local /proto/ embeds keep the ratio — SwipeyHubClient measures and rescales
  // those itself.
  const liveApp = solutionEmbedUrl?.startsWith('http') ?? false
  const solutionMedia = editorialMedia?.filter((item) => item.section === 'solution')
  const hasSolutionMedia = solutionMedia?.some((item) => item.src) ?? false

  return (
    <>
      {chrome ? <Nav /> : null}
      <main className="editorial-page">
        <section id="overview" className="editorial-hero" data-section="Overview">
          <div className={`editorial-shell editorial-hero-grid${heroImage ? '' : ' editorial-hero-grid-text-only'}`}>
            {/* Three rows: back link pinned to the image's top edge, lede centred
                against the image, role line pinned to the image's bottom edge. */}
            <div className="editorial-hero-copy">
              <div className="editorial-back-row">
                <Link href={backHref} className="font-mono editorial-back-link">
                  <span className="arrow-nudge-back">←</span> {backLabel}
                </Link>
              </div>
              <div className="editorial-hero-lede">
                <p className="font-mono editorial-kicker">{type}</p>
                <h1 className="font-serif">{title}</h1>
                <p className="font-reading editorial-oneliner">{oneliner}</p>
              </div>
              {roleHeadline ? (
                <div className="editorial-role-line">
                  <span className="font-mono">ROLE</span>
                  <p className="font-reading">{roleHeadline}</p>
                </div>
              ) : null}
            </div>
            {heroImage ? (
              <figure className="editorial-hero-image">
                <Image src={heroImage} alt={`${title} case study`} fill priority sizes="(max-width: 900px) 100vw, 56vw" />
              </figure>
            ) : null}
          </div>
        </section>

        {chrome ? <CaseStudyNav backHref={backHref} backLabel={backLabel} /> : null}

        <Chapter
          id="the-gap"
          section="Gap"
          className="editorial-intro-section"
          kicker="THE GAP"
          statement={problemHeadline}
        >
          {pullQuote ? (
            <aside className="editorial-quote-block">
              <span className="font-mono editorial-quote-label">THE INSIGHT_</span>
              <blockquote className="font-serif editorial-quote">{pullQuote}</blockquote>
            </aside>
          ) : null}
        </Chapter>

        <Chapter
          id="research"
          section="Research"
          className="editorial-research-section"
          kicker={researchKicker}
          statement={researchHeadline}
          briefTitle={researchBriefTitle}
          briefBody={researchBriefBody}
          briefItems={researchBriefItems}
          briefClassName="editorial-research-brief"
          listClassName="editorial-question-list"
          artifact={researchArtifact}
          artifactAlt={researchArtifactAlt}
          media={editorialMedia?.filter((item) => item.section === 'research')}
        />

        <Chapter
          id="decision"
          section="Decision"
          className="editorial-decision-section"
          kicker="THE DECISION"
          statement={challengeHeadline}
          briefTitle={decisionBriefTitle}
          briefBody={decisionBriefBody}
          briefItems={decisionBriefItems}
          briefClassName="editorial-decision-brief"
          listClassName="editorial-ia-list"
          artifact={decisionArtifact}
          artifactAlt={decisionArtifactAlt}
          media={editorialMedia?.filter((item) => item.section === 'decision')}
        />

        <Chapter
          className="editorial-process-section"
          kicker={processKicker}
          statement={processHeadline}
          artifact={processArtifact}
          artifactAlt={processArtifactAlt}
          media={editorialMedia?.filter((item) => item.section === 'process')}
        />

        {hasSolutionMedia && solutionEmbedUrl ? (
          <Chapter
            id="live"
            section="Live"
            className="editorial-solution-section"
            kicker={solutionKicker}
            statement={solutionHeadline}
            media={solutionMedia}
            afterMedia={solutionEmbedUrl?.startsWith('http') ? (
              <a
                href={solutionEmbedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono editorial-live-link"
              >
                {solutionEmbedCtaLabel} <span className="arrow-nudge" aria-hidden="true">↗</span>
              </a>
            ) : null}
          />
        ) : solutionEmbedUrl ? (
          <section id="live" className="editorial-section editorial-embed-section" data-section="Live">
            <div className="editorial-shell editorial-narrow">
              <p className="font-mono editorial-kicker">THE BUILD</p>
              {solutionHeadline ? <h2 className="font-reading editorial-statement">{solutionHeadline}</h2> : null}
            </div>
            <div className="editorial-shell editorial-artifact-wrap">
              <EditorialEmbed
                src={solutionEmbedUrl}
                title={solutionEmbedTitle}
                aspectRatio={solutionEmbedAspectRatio}
                live={liveApp}
              />
            </div>
          </section>
        ) : gallery ? (
          <FranklinsRedesignGallery headline={solutionHeadline} />
        ) : (
          <Chapter
            id="solution"
            section="Solution"
            className="editorial-solution-section"
            kicker={solutionKicker}
            statement={solutionHeadline}
            media={solutionMedia}
          />
        )}

        {outcomesHeadline ? (
          <section id="outcomes" className="editorial-section editorial-outcomes-section" data-section="Outcomes">
            <div className="editorial-shell editorial-narrow">
              <p className="font-mono editorial-kicker">WHAT STUCK</p>
              <h2 className="font-reading editorial-statement">{outcomesHeadline}</h2>
              <div className="editorial-tags font-mono">
                {tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              {next ? (
                <Link href={`/work/${next.slug}`} className="font-reading editorial-next-link">
                  <span>Next case study</span>
                  <strong>{next.title} <span className="arrow-nudge">→</span></strong>
                </Link>
              ) : null}
            </div>
          </section>
        ) : null}
      </main>
      {chrome ? <Footer /> : null}
    </>
  )
}
