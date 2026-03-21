import { Nav }              from '@/components/Nav'
import { HeroStage01 }      from '@/components/HeroStage01'
import { HeroStage02 }      from '@/components/HeroStage02'
import { HeroStage03 }      from '@/components/HeroStage03'
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
      <main style={{ paddingTop: '57px' }}>
        <HeroStage01 />
        <HeroStage02 />
        <HeroStage03 />
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
