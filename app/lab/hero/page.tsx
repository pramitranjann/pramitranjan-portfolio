import { About } from '@/components/About'
import { Contact } from '@/components/Contact'
import type { Metadata } from 'next'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { PhotographyStage } from '@/components/PhotographyStage'
import { SelectedWork } from '@/components/SelectedWork'
import { getPublicSiteContent } from '@/lib/site-content'
import { HeroDesignLab } from './HeroDesignLab'
import './hero-lab.css'

export const metadata: Metadata = {
  title: 'Homepage Hero Lab',
  description: 'A production-context preview of the portfolio homepage hero.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function HomepageHeroLabPage() {
  const content = await getPublicSiteContent()
  const projects = content.home.selectedWork.items

  return (
    <>
      <Nav />
      <div className="hero-lab-page">
        <HeroDesignLab
          projects={projects.slice(0, 3).map(({ title, href, cover, coverPosition, tags }) => ({
            title,
            href,
            cover,
            coverPosition,
            tags,
          }))}
        />
      </div>

      <main style={{ paddingTop: '57px' }}>
        <div id="selected-work" className="hero-lab-integrated-work">
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
