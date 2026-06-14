import type { Metadata } from 'next'
import { CreativeSectionIndexClient } from '@/components/CreativeSectionIndexClient'
import { buildMetadata } from '@/lib/seo'
import { getCaseStudiesBySection, getSiteContent } from '@/lib/site-content'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent()

  return buildMetadata({
    title: 'Mixed Media Projects',
    description: `${content.copy.creativePage.mixedMediaIndexTitle} Mixed media creative work and visual experiments by Pramit Ranjan.`,
    path: '/creative/mixed-media',
    keywords: ['Pramit Ranjan mixed media', 'mixed media portfolio', 'visual experiments'],
  })
}

export default async function MixedMediaPage() {
  const [projects, content] = await Promise.all([
    getCaseStudiesBySection('mixed-media'),
    getSiteContent(),
  ])

  return (
    <CreativeSectionIndexClient
      title={content.copy.creativePage.mixedMediaIndexTitle}
      backHref="/creative"
      backLabel={content.copy.creativePage.backLabel}
      columnsClass="grid grid-cols-2 md:grid-cols-3"
      projects={projects}
      cardStyle={content.design.photographyCards}
    />
  )
}
