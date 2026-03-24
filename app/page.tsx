import { Nav }              from '@/components/Nav'
import { HeroCarousel }     from '@/components/HeroCarousel'
import { SelectedWork }     from '@/components/SelectedWork'
import { PhotographyStage } from '@/components/PhotographyStage'
import { MoreWork }         from '@/components/MoreWork'
import { About }            from '@/components/About'
import { Contact }          from '@/components/Contact'
import { Footer }          from '@/components/Footer'
import { IntroAnimation }  from '@/components/IntroAnimation'
import { getSiteContent } from '@/lib/site-content'

export default async function HomePage() {
  const content = await getSiteContent()

  return (
    <>
      <Nav />
      <IntroAnimation />
      <HeroCarousel />
      <main style={{ paddingTop: '57px' }}>
        <SelectedWork content={content.home.selectedWork} cardStyle={content.design.supportingCards} />
        <PhotographyStage />
        <MoreWork content={content.home.moreWork} cardStyle={content.design.supportingCards} />
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
