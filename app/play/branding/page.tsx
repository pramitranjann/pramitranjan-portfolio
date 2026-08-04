import type { Metadata } from 'next'
import { CreativeSectionIndexClient } from '@/components/CreativeSectionIndexClient'
import { buildMetadata } from '@/lib/seo'
import { getCaseStudiesBySection, getSiteContent } from '@/lib/site-content'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent()

  return buildMetadata({
    title: 'Branding Projects',
    description: `${content.copy.creativePage.brandingIndexTitle} Brand identity and visual design work by Pramit Ranjan.`,
    path: '/play/branding',
    keywords: ['Pramit Ranjan branding', 'brand identity portfolio', 'visual design projects'],
  })
}

export default async function BrandingPage() {
  const [projects, content] = await Promise.all([
    getCaseStudiesBySection('branding'),
    getSiteContent(),
  ])

  return (
    <CreativeSectionIndexClient
      title={content.copy.creativePage.brandingIndexTitle}
      backHref="/play"
      backLabel={content.copy.creativePage.backLabel}
      columnsClass="grid grid-cols-2"
      imageSizes="(max-width: 767px) 100vw, 50vw"
      projects={projects}
      cardStyle={content.design.photographyCards}
    />
  )
}
