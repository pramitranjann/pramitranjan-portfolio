import { CreativeSectionIndexClient } from '@/components/CreativeSectionIndexClient'
import { getCaseStudiesBySection, getSiteContent } from '@/lib/site-content'

export default async function MixedMediaPage() {
  const [projects, content] = await Promise.all([
    getCaseStudiesBySection('mixed-media'),
    getSiteContent(),
  ])

  return (
    <CreativeSectionIndexClient
      title="Beyond the screen."
      backHref="/creative"
      backLabel="CREATIVE"
      columnsClass="grid grid-cols-2 md:grid-cols-3"
      projects={projects}
      cardStyle={content.design.photographyCards}
    />
  )
}
