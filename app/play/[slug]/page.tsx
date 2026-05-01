import { notFound } from 'next/navigation'
import { GameCaseStudyLayout } from '@/components/GameCaseStudyLayout'
import { getCaseStudiesBySection, getCaseStudyContent } from '@/lib/site-content'

export async function generateStaticParams() {
  const games = await getCaseStudiesBySection('play')
  return games.map((game) => ({ slug: game.slug }))
}

export default async function PlayCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const caseStudy = await getCaseStudyContent(slug)

  if (caseStudy.section !== 'play') {
    notFound()
  }

  return <GameCaseStudyLayout project={caseStudy} />
}
