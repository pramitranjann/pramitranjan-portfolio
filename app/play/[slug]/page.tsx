import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/JsonLd'
import { GameCaseStudyLayout } from '@/components/GameCaseStudyLayout'
import { buildBreadcrumbJsonLd, buildCaseStudyJsonLd, buildCaseStudyMetadata } from '@/lib/seo'
import { getCaseStudiesBySection, getCaseStudyContent } from '@/lib/site-content'

export async function generateStaticParams() {
  const games = await getCaseStudiesBySection('play')
  return games.map((game) => ({ slug: game.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const caseStudy = await getCaseStudyContent(slug)
  return buildCaseStudyMetadata(caseStudy)
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

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Play', path: '/play' },
            { name: caseStudy.title, path: `/play/${caseStudy.slug}` },
          ]),
          buildCaseStudyJsonLd(caseStudy),
        ]}
      />
      <GameCaseStudyLayout project={caseStudy} />
    </>
  )
}
