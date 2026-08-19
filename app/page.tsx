import type { Metadata } from 'next'
import { Nav }              from '@/components/Nav'
import { HeroCarousel }     from '@/components/HeroCarousel'
import { SelectedWork }     from '@/components/SelectedWork'
import { PhotographyStage } from '@/components/PhotographyStage'
import { About }            from '@/components/About'
import { Contact }          from '@/components/Contact'
import { Footer }          from '@/components/Footer'
import { IntroAnimation }  from '@/components/IntroAnimation'
import { PortfolioHero } from '@/components/PortfolioHero'
import { DEFAULT_DESCRIPTION, PERSON_KEYWORDS, buildMetadata } from '@/lib/seo'
import { getPublicSiteContent } from '@/lib/site-content'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicSiteContent()

  return buildMetadata({
    title: content.home.browserTitle,
    description: DEFAULT_DESCRIPTION,
    path: '/',
    keywords: PERSON_KEYWORDS,
  })
}

export default async function HomePage() {
  const content = await getPublicSiteContent()

  return (
    <>
      <Nav />
      <IntroAnimation />
      {content.home.heroMode === 'portfolio-carousel' ? (
        <PortfolioHero content={content.home.portfolioCarousel} />
      ) : (
        <HeroCarousel />
      )}
      <main style={{ paddingTop: '57px' }}>
        <div id="selected-work" style={{ scrollMarginTop: '57px' }}>
          <SelectedWork
            content={content.home.selectedWork}
            cardStyle={content.design.supportingCards}
            hoverPreviewSettings={content.design.hoverPreviews}
          />
        </div>
        <PhotographyStage cities={content.photography.cities} />
        <About
          body={content.home.about.body}
          spotifyLabel={content.home.about.spotifyLabel}
          listeningStyle={content.design.listeningCard}
        />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
