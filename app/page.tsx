import { Nav }              from '@/components/Nav'
import { HeroCarousel }     from '@/components/HeroCarousel'
import { SelectedWork }     from '@/components/SelectedWork'
import { PhotographyStage } from '@/components/PhotographyStage'
import { MoreWork }         from '@/components/MoreWork'
import { About }            from '@/components/About'
import { Contact }          from '@/components/Contact'
import { Footer }           from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <Nav />
      <HeroCarousel />
      <main style={{ paddingTop: '57px' }}>
        <SelectedWork />
        <PhotographyStage />
        <MoreWork />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
