import { Nav }              from '@/components/Nav'
import { HeroCarousel }     from '@/components/HeroCarousel'
import { SelectedWork }     from '@/components/SelectedWork'
import { PhotographyStage } from '@/components/PhotographyStage'
import { MoreWork }         from '@/components/MoreWork'
import { About }            from '@/components/About'
import { Contact }          from '@/components/Contact'
import { Footer }           from '@/components/Footer'
import dynamic from 'next/dynamic'
const IntroAnimation = dynamic(
  () => import('@/components/IntroAnimation').then(m => m.IntroAnimation),
  { ssr: false }
)

export default function HomePage() {
  return (
    <>
      <Nav />
      <IntroAnimation />
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
