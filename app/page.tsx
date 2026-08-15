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

export const metadata: Metadata = buildMetadata({
  title: 'UX Designer',
  description: DEFAULT_DESCRIPTION,
  path: '/',
  keywords: PERSON_KEYWORDS,
})

export default async function HomePage() {
  const content = await getPublicSiteContent()

  return (
    <>
      <Nav />
      <IntroAnimation />
      {content.home.heroMode === 'portfolio-carousel' ? (
        <PortfolioHero items={content.home.portfolioCarousel.items} />
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
        <PhotographyStage />
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
