import type { Metadata } from 'next'
import { PhotographyIndexClient } from '@/components/PhotographyIndexClient'
import { buildMetadata } from '@/lib/seo'
import { getSiteContent } from '@/lib/site-content'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent()

  return buildMetadata({
    title: 'Photography',
    description: `${content.photography.heroTitle} Analog and digital photography by Pramit Ranjan across Southeast Asia.`,
    path: '/creative/photography',
    keywords: ['Pramit Ranjan photography', 'Southeast Asia photography', 'film photography portfolio'],
  })
}

export default async function PhotographyPage() {
  const content = await getSiteContent()
  return <PhotographyIndexClient heroTitle={content.photography.heroTitle} cities={content.photography.cities} cardStyle={content.design.photographyCards} />
}
