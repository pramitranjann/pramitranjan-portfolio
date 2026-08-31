import Image from 'next/image'
import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { ProjectCard } from '@/components/ProjectCard'
import type { CardStyleSettings, CaseStudyContent, HoverPreviewSettings } from '@/lib/site-content-schema'

const CARD_IMAGE_RATIO = '4 / 3'

const CARD_TAGS: Record<string, string[]> = {
  'swipey-fields': ['PRODUCT', 'AI'],
  'swipey-admin': ['PRODUCT', 'MOBILE'],
  'swipey-get-started': ['PRODUCT', 'ONBOARDING'],
  'swipey-rbac': ['PRODUCT', 'ACCESS'],
}

type Story = CaseStudyContent & { navStyle?: unknown; listeningStyle?: unknown }

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
  return (
    <>
      <Nav />
      <main className="editorial-page">
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
                  Four case studies, spanning AI, mobile, onboarding and access.
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
              <Image
                src={coverImage}
                alt="Swipey"
                fill
                style={{ objectFit: coverFit ?? 'cover', objectPosition: 'center' }}
                sizes="(max-width: 900px) 100vw, 56vw"
              />
            </figure>
          </div>
        </section>

        <section className="editorial-section swipey-hub-stories">
          <div
            className="swipey-hub-shell editorial-shell grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
            style={{ gap: 'var(--layout-card-gap)' }}
          >
            {stories.map((story) => (
              <ProjectCard
                key={story.slug}
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
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
